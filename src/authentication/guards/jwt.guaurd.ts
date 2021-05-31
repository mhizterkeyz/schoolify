import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UserService } from '@src/user';
import { AuthenticationService } from '../authentication.service';

interface IAuthPayload {
  id: string;
  password: string;
  iat: number;
}

@Injectable()
export class JWTAuthGuard implements CanActivate {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly userService: UserService,
  ) {}

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

    const { password, id } = authPayload;
    const user = await this.userService.findByIDAndPassword(id, password);
    if (!user) {
      throw new UnauthorizedException();
    }

    request.user = user;

    return true;
  }
}
