import { applyDecorators, UseGuards } from '@nestjs/common';

import { JWTAuthGuard } from '@src/guards/jwt.guaurd';
import { ApplyDecorators } from '@src/util/common/common.response';

export const UseJWT = (): ApplyDecorators => {
  return applyDecorators(UseGuards(JWTAuthGuard));
};
