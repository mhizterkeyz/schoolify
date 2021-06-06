import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { Schema } from 'mongoose';

import { USER } from '@src/constants';
import { LeanUser, User } from '@src/user';
import { BaseModel, BaseSchema } from '@src/util';

@BaseSchema()
export class School extends BaseModel {
  @ApiProperty({ type: String })
  @Prop({ type: String, unique: false, required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, unique: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, unique: false })
  @IsPhoneNumber(null)
  @IsOptional()
  phonenumber?: string;

  @ApiProperty({ type: String })
  @Prop({ type: String })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ type: LeanUser })
  @Prop({ type: Schema.Types.ObjectId, ref: USER, autopopulate: true })
  owner: User;

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

export const SchoolSchema = SchemaFactory.createForClass(School);
