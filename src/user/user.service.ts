import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Logger } from '@src/logger';
import { USER } from '@src/constants';
import { ModelMethods } from '@src/util';
import { LeanUser, UpdateUserPayload, User } from './schema/user.schema';

class UserModelMethods extends ModelMethods<User> {
  constructor(userModel: Model<User>) {
    super(userModel);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.model.findOne({ email, isDeleted: false });
  }

  async findByIDEmailAndPassword(
    _id: string,
    email: string,
    password: string,
  ): Promise<User | null> {
    return this.model.findOne({ _id, password, email, isDeleted: false });
  }

  async invalidPassword(user: User, password: string): Promise<boolean> {
    if (!user) {
      return true;
    }

    return !(await user.authenticatePassword(password));
  }
}

@Injectable()
export class UserService extends UserModelMethods {
  constructor(
    @InjectModel(USER) userModel: Model<User>,
    private readonly logger: Logger,
  ) {
    super(userModel);
    this.logger.setContext(UserService.name);
  }

  async updateUserDetails(
    user: User,
    update: UpdateUserPayload,
  ): Promise<LeanUser> {
    this.logger
      .setMethodName('updateUserDetails')
      .info('updating user details and converting to json');
    return this.json(await this.updateOne(user, update));
  }

  async deleteUser(user: User): Promise<LeanUser> {
    this.logger.setMethodName('deleteUser').info('deleting user account');
    return this.json(await this.updateOne(user, { isDeleted: true }));
  }
}
