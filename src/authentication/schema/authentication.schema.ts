import { ApiProperty, PickType } from '@nestjs/swagger';

import { LeanUser, User } from '@src/user';

export class LoggedInUser extends LeanUser {
  @ApiProperty({ description: 'access token' })
  accessToken: string;
}

export class SignupUser extends PickType(User, ['email', 'password', 'name']) {}
