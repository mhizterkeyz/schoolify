import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { USER } from '@src/constants';
import { User } from './schema/user.schema';

class UserModelMethods {
  constructor(private readonly userModel: Model<User>) {}
}

@Injectable()
export class UserService extends UserModelMethods {
  constructor(@InjectModel(USER) userModel: Model<User>) {
    super(userModel);
  }
}
