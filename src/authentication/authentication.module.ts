import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { configuration } from '@src/config';
import { UserModule } from '@src/user';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';

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
    UserModule,
  ],
  providers: [AuthenticationService],
  controllers: [AuthenticationController],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
