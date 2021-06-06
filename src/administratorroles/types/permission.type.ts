export enum Permission {
  CanReadAdministratorRoles = 'can.read.administratorRoles',
  CanCreateAdministratorRoles = 'can.create.administratorRoles',
  CanUpdateAdministratorRoles = 'can.update.administratorRoles',
  CanDeleteAdministratorRoles = 'can.delete.administratorRoles',
}

export const Permissions = Object.values(Permission);
