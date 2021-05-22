import { ApiProperty } from '@nestjs/swagger';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { hash, compare } from 'bcryptjs';

import { BaseModel, BaseSchema } from '@util/common/base.schema';

@BaseSchema()
export class User extends BaseModel {
  @ApiProperty({
    description: 'user email',
    required: true,
  })
  @Prop({
    type: 'string',
    required: true,
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

  authenticatePassword(_password: string): boolean {
    return false;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function hashUserPassword(next): Promise<void> {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const values = this as User;
  const passwordHash = await hash(values.password, 8);
  values.password = passwordHash;
  next();
});

UserSchema.methods = {
  async authenticatePassword(password: string): Promise<boolean> {
    return compare(password, this.password);
  },
};