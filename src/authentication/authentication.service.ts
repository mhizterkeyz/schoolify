import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Logger } from '@src/logger';
import { User } from '@src/user/schema/user.schema';
import { UserService } from '@src/user';
import { DatabaseService, WriteSession } from '@src/database';
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
      const { email } = signupPayload;
      const userExists = !!(await this.userService.findUserByEmail(email));
      if (userExists) {
        throw new ConflictException('User with email already exists');
      }

      contextLogger.info('creating user document');
      const user = await this.userService.createSingleUser(
        signupPayload as User,
        writeSession,
      );

      contextLogger.info('sending email verification code');
      await this.sendEmailVerificationCode(user, writeSession);
      await writeSession.save();

      return this.getLoggedInUser(user);
    } catch (error) {
      await writeSession.abort();
      throw error;
    }
  }

  async verifyUserEmail(code: string, logger: Logger): Promise<LoggedInUser> {
    const contextLogger = logger.context({ code });

    contextLogger.info('getting verification token');
    const token = await this.tokenService.getTokenByCode(code);
    if (!token || token.isUsed) {
      throw new BadRequestException('Invalid verification code');
    }

    contextLogger.info('verifying user email');
    const user = await this.userService.findUserByID(token.meta as string);
    await this.userService.updateUser(user, { emailVerified: true });

    contextLogger.info('marking token as used');
    await this.tokenService.updateToken(token, { isUsed: true });

    return this.getLoggedInUser(user);
  }

  async resendEmailVerificationCode(
    email: string,
    logger: Logger,
  ): Promise<void> {
    logger.context({ email }).info('finding user by email');
    const user = await this.userService.findUserByEmail(email);
    if (user && !user.emailVerified) {
      logger.context({ email }).info('sending email verification code');
      await this.sendEmailVerificationCode(user);
    }
  }

  async sendEmailVerificationCode(
    user: User,
    writeSessoin?: WriteSession,
  ): Promise<void> {
    const { email, name } = user;
    const token = await this.tokenService.createEmailVerificationToken(
      user.id,
      writeSessoin,
    );
    await this.notificationService.sendEmailVerificationMessage(
      { name, email },
      { name, authToken: token.code },
    );
  }

  getLoggedInUser(user: User): LoggedInUser {
    const accessToken = this.signPayload({
      id: user.id,
      password: user.password,
    });
    const jsonUser = this.userService.jsonUser(user);

    return { ...jsonUser, accessToken };
  }

  signPayload(payload: Record<string, unknown>): string {
    return this.jwtService.sign(payload);
  }
}
