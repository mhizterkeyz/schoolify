import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Logger } from '@src/logger';
import { User } from '@src/user/schema/user.schema';
import { UserService } from '@src/user';
import { DatabaseService, WriteSession } from '@src/database';
import { NotificationService } from '@src/notification';
import {
  LoggedInUser,
  LoginPayload,
  ResetPasswordPayload,
  SignupUser,
} from './schema/authentication.schema';
import { TokenService } from './token.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly databaseService: DatabaseService,
    private readonly notificationService: NotificationService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(AuthenticationService.name);
  }

  async signupUser(signupPayload: SignupUser): Promise<LoggedInUser> {
    const writeSession = await this.databaseService.startWriteSession();
    try {
      this.logger.setMethodName('signupUser').info('checking if user exists');
      const { email } = signupPayload;
      const userExists = !!(await this.userService.findUserByEmail(email));
      if (userExists) {
        throw new ConflictException('User with email already exists');
      }

      this.logger.info('creating user document');
      const user = await this.userService.createSingleUser(
        signupPayload as User,
        writeSession,
      );

      this.logger.info('sending email verification code');
      await this.sendEmailVerificationCode(user, writeSession);
      await writeSession.save();

      return this.getLoggedInUser(user);
    } catch (error) {
      await writeSession.abort();
      throw error;
    }
  }

  async verifyUserEmail(code: string): Promise<LoggedInUser> {
    this.logger
      .setMethodName('verifyUserEmail')
      .info('getting verification token');
    const token = await this.tokenService.getTokenByCode(code);
    if (!token || token.isUsed) {
      throw new BadRequestException('Invalid verification code');
    }

    this.logger.info('verifying user email');
    const user = await this.userService.findUserByID(token.meta as string);
    await this.userService.updateUser(user, { emailVerified: true });

    this.logger.info('marking token as used');
    await this.tokenService.updateToken(token, { isUsed: true });

    return this.getLoggedInUser(user);
  }

  async resendEmailVerificationCode(email: string): Promise<void> {
    this.logger
      .setMethodName('resendEmailVerificationCode')
      .info('finding user by email');
    const user = await this.userService.findUserByEmail(email);
    if (user && !user.emailVerified) {
      this.logger.info('sending email verification code');
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

  async sendRecoverPasswordEmail(email: string): Promise<void> {
    this.logger
      .setMethodName('sendRecoverPasswordEmail')
      .info('findind user by email');
    const user = await this.userService.findUserByEmail(email);
    if (user) {
      this.logger.info('starting write session');
      const writeSession = await this.databaseService.startWriteSession();
      try {
        this.logger.info('creating recovery code');
        const {
          code: recoveryCode,
        } = await this.tokenService.createPasswordRecoveryToken(
          user.id,
          writeSession,
        );

        this.logger.info('sending password recovery email');
        await this.notificationService.sendPasswordRecoveryMessage(
          { email: user.email, name: user.name },
          { recoveryCode },
        );

        await writeSession.save();
      } catch (error) {
        await writeSession.abort();
      }
    }
  }

  async resetPassword({
    code,
    password,
  }: ResetPasswordPayload): Promise<LoggedInUser> {
    this.logger
      .setMethodName('resetPassword')
      .info('getting user id by password recovery code');
    const userId = await this.tokenService.getUserIDByPasswordRecoveryCode(
      code,
    );
    this.logger.info('finding and updating user by id');
    const user = await this.userService.findUserByID(userId);
    await this.userService.updateUser(user, { password });

    return this.getLoggedInUser(user);
  }

  async loginUser({ email, password }: LoginPayload): Promise<LoggedInUser> {
    this.logger.setMethodName('loginUser').info('finding user by email');
    const user = await this.userService.findUserByEmail(email);
    this.logger.info('validating user password');
    const invalidPassword = await this.userService.invalidPassword(
      user,
      password,
    );
    if (!user || invalidPassword) {
      throw new UnauthorizedException('invalid credentials');
    }

    return this.getLoggedInUser(user);
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

  decodeToken<T>(token: string): T {
    return this.jwtService.decode(token) as T;
  }
}
