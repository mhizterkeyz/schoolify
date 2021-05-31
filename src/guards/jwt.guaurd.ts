import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AuthenticationService } from '@src/authentication';

import { UserService } from '@src/user';

interface IAuthPayload {
  id: string;
  email: string;
  password: string;
  iat: number;
}

@Injectable()
export class JWTAuthGuard implements CanActivate {
  private authenticationService: AuthenticationService;

  private userService: UserService;

  constructor(private readonly moduleRef: ModuleRef) {}

  onModuleInit(): void {
    this.authenticationService = this.moduleRef.get<AuthenticationService>(
      AuthenticationService,
      { strict: false },
    );
    this.userService = this.moduleRef.get<UserService>(UserService, {
      strict: false,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;
    if (!authorization) {
      throw new BadRequestException('no authorization header found');
    }

    const authPayload = this.authenticationService.decodeToken(
      authorization.replace('Bearer ', ''),
    ) as IAuthPayload;
    if (!authPayload) {
      throw new UnauthorizedException();
    }

    const { password, id, email } = authPayload;
    const user = await this.userService.findByIDEmailAndPassword(
      id,
      email,
      password,
    );
    if (!user) {
      throw new UnauthorizedException();
    }

    request.user = user;

    return true;
  }
}
