import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

import { AppModule } from './app.module';
import useSwaggerUIAuthStoragePlugin from './swagger_plugin';
import corsConfig from './cors.config';
import { AllExceptionsFilter } from './util/exceptions/all-exception.filter';
import { ValidationFilter } from './util/exceptions/validation.filter';
import { APPLICATION_NAME } from './constants';
import { ValidationPipe } from './util/pipes/validation.pipe';
import { Logger } from './logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: corsConfig,
    bodyParser: false,
    logger: false,
  });

  app.useLogger(new Logger());
  app.useGlobalFilters(new AllExceptionsFilter(), new ValidationFilter());
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const port = configService.get<string>('port');
  const env = configService.get<string>('env');

  const options = new DocumentBuilder()
    .setTitle(`${APPLICATION_NAME} API`)
    .setDescription(`API endpoints for ${APPLICATION_NAME} App`)
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      plugins: [useSwaggerUIAuthStoragePlugin()],
    },
  });

  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ limit: '100mb', extended: true }));

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  const server = await app.listen(port);

  server.setTimeout(1200000);

  // eslint-disable-next-line
  console.log(`${env} app running on: ${await app.getUrl()}`);
}

bootstrap();
