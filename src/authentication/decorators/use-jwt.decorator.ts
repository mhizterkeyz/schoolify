import { applyDecorators, UseGuards } from '@nestjs/common';

import { ApplyDecorators } from '@src/util';
import { JWTAuthGuard } from '../guards/jwt.guaurd';

export const UseJWT = (): ApplyDecorators => {
  return applyDecorators(UseGuards(JWTAuthGuard));
};
