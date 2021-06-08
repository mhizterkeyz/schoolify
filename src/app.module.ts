import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as mongooseAutoPopulate from 'mongoose-autopopulate';

import { AuthenticationModule } from './authentication/authentication.module';
import { configuration } from './config';
import { LoggerModule } from './logger/logger.module';
import { SchoolMiddleware } from './middlewares/school.middlewar';
import { NotificationModule } from './notification/notification.module';
import { SchoolController } from './school/school.controller';
import { SchoolModule } from './school/school.module';
import { SchoolAdministratorModule } from './schooladministrator/school-administrator.module';
import { UserModule } from './user/user.module';
import { UtilModule } from './util/util.module';

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
    NotificationModule,
    SchoolModule,
    SchoolAdministratorModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(SchoolMiddleware).forRoutes(SchoolController);
  }
}
