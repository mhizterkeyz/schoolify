import { ApiProperty, PickType } from '@nestjs/swagger';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
// eslint-disable-next-line import/no-extraneous-dependencies
import { hash, compare, genSalt } from 'bcryptjs';
import { BaseModel, BaseSchema } from '@src/util/common/base.schema';

@BaseSchema()
export class User extends BaseModel {
  @ApiProperty({
    description: 'user email',
    required: true,
  })
  @Prop({
    type: 'string',
    required: true,
    unique: false,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'user password',
    required: true,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Prop({
    type: 'string',
    required: true,
  })
  password: string;

  @ApiProperty({
    description: "user's name",
    required: false,
  })
  @Prop({ type: 'string', required: true })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    type: Boolean,
    description: 'email is verified?',
  })
  @Prop({
    type: Boolean,
    default: false,
  })
  emailVerified?: boolean;

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

  async authenticatePassword(_password: string): Promise<boolean> {
    return false;
  }
}

export class LeanUser extends PickType(User, [
  'email',
  'name',
  'isDeleted',
  'createdAt',
  'updatedAt',
  'id',
  'emailVerified',
]) {}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function hashUserPassword(next): Promise<void> {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const values = this as User;
  const salt = await genSalt(Math.floor(Math.random() * (15 - 10)) + 10);
  const passwordHash = await hash(values.password, salt);
  values.password = passwordHash;
  next();
});

UserSchema.methods = {
  async authenticatePassword(password: string): Promise<boolean> {
    return compare(password, this.password);
  },
};

// Payloads
export class UpdateUserPayload extends PickType(User, ['name']) {}
