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
      await this.failIfUserEmailExists(email);

      this.logger.info('creating user document');
      const user = await this.userService.create(
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
    const user = await this.userService.findById(token.meta as string);
    await this.userService.updateOne(user, { emailVerified: true });

    this.logger.info('marking token as used');
    await this.tokenService.updateOne(token, { isUsed: true });

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
    const user = await this.userService.findById(userId);
    await this.userService.updateOne(user, { password });

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

  async updateUserEmail(user: User, email: string): Promise<LoggedInUser> {
    this.logger
      .setMethodName('updateUserEmail')
      .info('checking if email already exists');
    await this.failIfUserEmailExists(email);

    this.logger.info('updating user email');
    await this.userService.updateOne(user, {
      email,
      emailVerified: false,
    });

    this.logger.info('sending email verification message');
    await this.sendEmailVerificationCode(user);

    this.logger.info('signing auth payload');
    return this.getLoggedInUser(user);
  }

  async updateUserPassword(
    user: User,
    password: string,
  ): Promise<LoggedInUser> {
    this.logger
      .setMethodName('updateUserPassword')
      .info('updating user password');
    await this.userService.updateOne(user, { password });

    this.logger.info('signing auth payload');
    return this.getLoggedInUser(user);
  }

  async failIfUserEmailExists(email: string): Promise<void> {
    const userExists = !!(await this.userService.findUserByEmail(email));
    if (userExists) {
      throw new ConflictException('User with email already exists');
    }
  }

  getLoggedInUser(user: User): LoggedInUser {
    const accessToken = this.signPayload({
      id: user.id,
      email: user.email,
      password: user.password,
    });
    const jsonUser = this.userService.json(user);

    return { ...jsonUser, accessToken };
  }

  signPayload(payload: Record<string, unknown>): string {
    return this.jwtService.sign(payload);
  }

  decodeToken<T>(token: string): T {
    return this.jwtService.decode(token) as T;
  }
}
