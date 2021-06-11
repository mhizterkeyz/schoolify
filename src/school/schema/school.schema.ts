import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

import { BaseModel, BaseSchema } from '@src/util/common/base.schema';
import { ValidateWithService } from '@src/decorators/validation/service-validation.decorator';

@BaseSchema()
export class School extends BaseModel {
  @ApiProperty({ type: String })
  @Prop({ type: String, unique: false, required: true })
  @IsString()
  @IsNotEmpty()
  @ValidateWithService({
    serviceName: 'SchoolService',
    methodName: 'validateSchoolName',
  })
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
  @ValidateWithService({
    serviceName: 'SchoolService',
    methodName: 'validateSchoolSlug',
  })
  slug?: string;

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
