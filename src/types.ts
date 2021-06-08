export type Permission =
  //----------------------------------------
  // AdministorRoles Permissions
  | 'can.read.administratorRoles'
  | 'can.create.administratorRoles'
  | 'can.update.administratorRoles'
  | 'can.delete.administratorRoles'

  // School Permissions
  | 'can.update.school'
  | 'can.delete.school'
  //---------------------------------------
  | '';
