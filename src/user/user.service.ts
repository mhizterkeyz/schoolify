import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { USER } from '@src/constants';
import { LeanUser, User } from './schema/user.schema';

class UserModelMethods {
  constructor(private readonly userModel: Model<User>) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email, isDeleted: false });
  }

  async createSingleUser(user: User): Promise<User> {
    return this.userModel.create(user);
  }

  jsonUser(user: User): LeanUser {
    return user.toJSON();
  }
}

@Injectable()
export class UserService extends UserModelMethods {
  constructor(@InjectModel(USER) userModel: Model<User>) {
    super(userModel);
  }
}
