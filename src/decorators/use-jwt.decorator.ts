import { applyDecorators, UseGuards } from '@nestjs/common';

import { JWTAuthGuard } from '@src/guards';
import { ApplyDecorators } from '@src/util';

export const UseJWT = (): ApplyDecorators => {
  return applyDecorators(UseGuards(JWTAuthGuard));
};
