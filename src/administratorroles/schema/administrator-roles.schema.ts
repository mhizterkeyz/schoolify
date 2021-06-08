import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Schema } from 'mongoose';

import { SCHOOL } from '@src/constants';
import { Permission } from '@src/types';
import { BaseModel, BaseSchema } from '@src/util/common/base.schema';
import { School } from '@src/school/schema/school.schema';

@BaseSchema()
export class AdministratorRole extends BaseModel {
  @ApiProperty({ type: School })
  @Prop({ type: Schema.Types.ObjectId, required: true, ref: SCHOOL })
  school: string | School;

  @ApiProperty({ type: [String] })
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
