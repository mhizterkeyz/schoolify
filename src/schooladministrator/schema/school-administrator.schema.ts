import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { ADMINISTRATOR_ROLES, SCHOOL, USER } from '@src/constants';
import { BaseModel, BaseSchema } from '@src/util/common/base.schema';
import { User } from '@src/user/schema/user.schema';
import { School } from '@src/school/schema/school.schema';
import { AdministratorRole } from '@src/administratorroles/schema/administrator-roles.schema';

@BaseSchema()
export class SchoolAdministrator extends BaseModel {
  @ApiProperty({ type: User })
  @Prop({
    type: Schema.Types.ObjectId,
    required: true,
    ref: USER,
  })
  user: string | User;

  @ApiProperty()
  @Prop({ type: Boolean, default: false })
  isOwner?: boolean;

  @ApiProperty({ type: School })
  @Prop({
    type: Schema.Types.ObjectId,
    required: true,
    ref: SCHOOL,
    autopopulate: true,
  })
  school: string | School;

  @ApiProperty({ type: AdministratorRole })
  @Prop({
    type: Schema.Types.ObjectId,
    ref: ADMINISTRATOR_ROLES,
    autopopulate: true,
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
