import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, PickType } from '@nestjs/swagger';

import { USER } from '@src/constants';
import { LeanUser } from '@src/user';
import { BaseModel, BaseSchema } from '@src/util';
import { Schema } from 'mongoose';

@BaseSchema()
export class School extends BaseModel {
  @ApiProperty({ type: String })
  @Prop({ type: String, unique: false, required: false })
  name: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, unique: false })
  email?: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, unique: false })
  phonenumber?: string;

  @ApiProperty({ type: LeanUser })
  @Prop({ type: Schema.Types.ObjectId, ref: USER })
  owner: string | LeanUser;

  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'school is deleted?',
  })
  @Prop({
    type: Boolean,
    default: false,
  })
  isDeleted?: boolean;
}

export class LeanSchool extends PickType(School, [
  'email',
  'name',
  'isDeleted',
  'createdAt',
  'updatedAt',
  'id',
  'owner',
  'phonenumber',
]) {}

export const SchoolSchema = SchemaFactory.createForClass(School);
