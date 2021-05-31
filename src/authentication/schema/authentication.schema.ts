import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Schema } from 'mongoose';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { LeanUser, User } from '@src/user';
import { BaseModel, BaseSchema } from '@src/util';

export class LoggedInUser extends LeanUser {
  @ApiProperty({ description: 'access token' })
  accessToken: string;
}

export class SignupUser extends PickType(User, ['email', 'password', 'name']) {}

export class VerifyEmail {
  @ApiProperty({ description: 'verification code' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class ResetPasswordPayload {
  @ApiProperty({ description: 'password recovery code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'new password',
    required: true,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;
}

export class ChangePasswordPayload extends PickType(ResetPasswordPayload, [
  'password',
]) {}

export class ResendEmailVerificationCode {
  @ApiProperty({ description: 'user email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class LoginPayload {
  @ApiProperty({ description: 'user email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

@BaseSchema()
export class Token extends BaseModel {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: Date })
  expires?: Date;

  @Prop({ type: Boolean, default: false })
  isRevoked?: boolean;

  @Prop({ type: Boolean, default: false })
  isUsed?: boolean;

  @Prop({ type: Schema.Types.Mixed })
  meta?: unknown;

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

export const TokenSchema = SchemaFactory.createForClass(Token);
