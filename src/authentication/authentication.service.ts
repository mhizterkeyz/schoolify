import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Logger } from '@src/logger';
import { User } from '@src/user/schema/user.schema';
import { UserService } from '@src/user';
import { LoggedInUser, SignupUser } from './schema/authentication.schema';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signupUser(
    signupPayload: SignupUser,
    logger: Logger,
  ): Promise<LoggedInUser> {
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
    const user = await this.userService.createSingleUser(signupPayload as User);
    const accessToken = this.signPayload({
      id: user.id,
      password: user.password,
    });

    contextLogger.info('signing user auth payload');
    const jsonUser = this.userService.jsonUser(user);

    return { ...jsonUser, accessToken };
  }

  signPayload(payload: Record<string, unknown>): string {
    return this.jwtService.sign(payload);
  }
}
