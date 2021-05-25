import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, PickType } from '@nestjs/swagger';

import { LeanUser, User } from '@src/user';
import { BaseModel, BaseSchema } from '@src/util';

export class LoggedInUser extends LeanUser {
  @ApiProperty({ description: 'access token' })
  accessToken: string;
}

export class SignupUser extends PickType(User, ['email', 'password', 'name']) {}

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
}

export const TokenSchema = SchemaFactory.createForClass(Token);
