import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Schema } from 'mongoose';

import { School } from '@src/school';
import { BaseModel, BaseSchema } from '@src/util';
import { SCHOOL } from '@src/constants';
import { Permission, Permissions } from '../types';

@BaseSchema()
export class AdministratorRole extends BaseModel {
  @ApiProperty({ type: School })
  @Prop({ type: Schema.Types.ObjectId, required: true, ref: SCHOOL })
  school: string | School;

  @ApiProperty({ type: [String], example: Permissions })
  @Prop({ type: Array, default: [] })
  permissions?: Permission[];

  @ApiProperty({ type: String, example: 'Owner' })
  @Prop({ type: String, required: true })
  name: string;

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
