import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';

import { AdministratorRole } from '@src/administratorroles/schema/administrator-roles.schema';
import { School } from '@src/school/schema/school.schema';
import { SchoolAdministratorService } from '@src/schooladministrator/schol-administrator.service';
import { Permission } from '@src/types';
import { User } from '@src/user/schema/user.schema';

@Injectable()
export class PermissionGuard {
  private schoolAdministratorService: SchoolAdministratorService;

  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit(): void {
    this.schoolAdministratorService = this.moduleRef.get<
      SchoolAdministratorService
    >(SchoolAdministratorService, { strict: false });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const permissions = this.reflector.get<Permission[]>(
      'permissions',
      context.getHandler(),
    );
    const school = request.school as School;
    const user = request.user as User;
    const schools = await this.schoolAdministratorService.getByUserId(user.id);
    const selectedSchool = schools.find(
      item => (item.school as School).id.toString() === school.id.toString(),
    );
    const error = new ForbiddenException(
      'You dont have permissioin to perform this operation',
    );
    if (!selectedSchool) {
      throw error;
    }
    const canActivate =
      permissions.every(permission =>
        (selectedSchool?.role as AdministratorRole)?.permissions?.includes(
          permission,
        ),
      ) || selectedSchool.isOwner;
    if (!canActivate) {
      throw error;
    }
    request.schools = schools;
    return canActivate;
  }
}
