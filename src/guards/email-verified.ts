import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@src/user/schema/user.schema';

@Injectable()
export class EmailVerified implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    const emailVerified = user && user.emailVerified;
    const error = new ForbiddenException('please verify your email');
    const allowConditions = this.reflector.get<string[]>(
      'allow-conditions',
      context.getHandler(),
    );

    if (allowConditions && allowConditions.includes('email-verified')) {
      request['allow-if-email-verified'] = {
        canActivate: emailVerified,
        error,
      };

      return true;
    }

    if (!emailVerified) {
      throw error;
    }

    return emailVerified;
  }
}
