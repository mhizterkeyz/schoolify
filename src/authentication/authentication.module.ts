import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { configuration } from '@src/config';
import { TOKEN } from '@src/constants';
import { NotificationModule } from '@src/notification';
import { UserModule } from '@src/user';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { TokenSchema } from './schema/authentication.schema';
import { TokenService } from './token.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory() {
        return {
          secret: configuration().jwt.secret,
        };
      },
    }),
    MongooseModule.forFeature([{ name: TOKEN, schema: TokenSchema }]),
    UserModule,
    NotificationModule,
  ],
  providers: [TokenService, AuthenticationService],
  controllers: [AuthenticationController],
  exports: [TokenService, AuthenticationService],
})
export class AuthenticationModule {}
