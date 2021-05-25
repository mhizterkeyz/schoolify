import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Logger } from '@src/logger';
import { User } from '@src/user/schema/user.schema';
import { UserService } from '@src/user';
import { DatabaseService } from '@src/database';
import { NotificationService } from '@src/notification';
import { LoggedInUser, SignupUser } from './schema/authentication.schema';
import { TokenService } from './token.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly databaseService: DatabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  async signupUser(
    signupPayload: SignupUser,
    logger: Logger,
  ): Promise<LoggedInUser> {
    const writeSession = await this.databaseService.startWriteSession();
    try {
      const contextLogger = logger.context({
        event: 'signupUser',
        signupPayload,
      });

      contextLogger.info('checking if user exists');
      const { email, name } = signupPayload;
      const userExists = !!(await this.userService.findUserByEmail(email));
      if (userExists) {
        throw new ConflictException('User with email already exists');
      }

      contextLogger.info('creating user document');
      const user = await this.userService.createSingleUser(
        signupPayload as User,
        writeSession,
      );
      const accessToken = this.signPayload({
        id: user.id,
        password: user.password,
      });

      contextLogger.info('creating email verification code');
      const token = await this.tokenService.createEmailVerificationToken(
        user.id,
        writeSession,
      );

      contextLogger.info('sending email verification code');
      await this.notificationService.sendEmailVerificationMessage(
        { name, email },
        { name, authToken: token.code },
      );

      contextLogger.info('signing user auth payload');
      const jsonUser = this.userService.jsonUser(user);
      await writeSession.save();

      return { ...jsonUser, accessToken };
    } catch (error) {
      await writeSession.abort();
      throw error;
    }
  }

  signPayload(payload: Record<string, unknown>): string {
    return this.jwtService.sign(payload);
  }
}
