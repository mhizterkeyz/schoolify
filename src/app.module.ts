import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as mongooseAutoPopulate from 'mongoose-autopopulate';

import { AuthenticationModule } from './authentication';
import { configuration } from './config';
import { DatabaseModule } from './database';
import { LoggerModule } from './logger';
import { SchoolMiddleware } from './middlewares';
import { NotificationModule } from './notification';
import { SchoolController, SchoolModule } from './school';
import { UserModule } from './user';
import { UtilModule } from './util';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: configuration().isTest,
      load: [configuration],
    }),
    MongooseModule.forRoot(configuration().database.url, {
      connectionFactory(connection: Connection) {
        connection.plugin(mongooseAutoPopulate);

        return connection;
      },
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }),
    UtilModule,
    LoggerModule,
    UserModule,
    AuthenticationModule,
    DatabaseModule,
    NotificationModule,
    SchoolModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(SchoolMiddleware).forRoutes(SchoolController);
  }
}
