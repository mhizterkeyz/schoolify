import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthenticationModule } from './authentication';
import { configuration } from './config';
import { DatabaseModule } from './database';
import { LoggerModule } from './logger';
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
  ],
})
export class AppModule {}
