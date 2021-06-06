import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { User } from '@src/user';
import { BaseModel, BaseSchema } from '@src/util';
import { ADMINISTRATOR_ROLES, SCHOOL, USER } from '@src/constants';
import { School } from '@src/school';
import { AdministratorRole } from '@src/administratorroles';

@BaseSchema()
export class SchoolAdministrator extends BaseModel {
  @ApiProperty({ type: User })
  @Prop({
    type: Schema.Types.ObjectId,
    required: true,
    ref: USER,
  })
  user: string | User;

  @ApiProperty({ type: School })
  @Prop({
    type: Schema.Types.ObjectId,
    required: true,
    ref: SCHOOL,
  })
  school: string | School;

  @ApiProperty({ type: AdministratorRole })
  @Prop({
    type: Schema.Types.ObjectId,
    ref: ADMINISTRATOR_ROLES,
  })
  role?: string | AdministratorRole;

  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'document is deleted?',
  })
  @Prop({
    type: Boolean,
    default: false,
  })
  isDeleted?: boolean;
}

export const SchoolAdministratorSchema = SchemaFactory.createForClass(
  SchoolAdministrator,
);
