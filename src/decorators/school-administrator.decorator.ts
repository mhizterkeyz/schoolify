import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { JWTAuthGuard } from '@src/guards/jwt.guaurd';
import { PermissionGuard } from '@src/guards/permission.guard';
import { Permission } from '@src/types';
import { ApplyDecorators } from '@src/util/common/common.response';

export const SchoolAdministrator = (
  ...permissions: Permission[]
): ApplyDecorators => {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    UseGuards(JWTAuthGuard),
    UseGuards(PermissionGuard),
  );
};
