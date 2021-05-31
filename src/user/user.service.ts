import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { merge } from 'lodash';

import { Logger } from '@src/logger';
import { USER } from '@src/constants';
import { WriteSession } from '@src/database';
import { LeanUser, UpdateUserPayload, User } from './schema/user.schema';

class UserModelMethods {
  constructor(private readonly userModel: Model<User>) {}

  async onModuleInit(): Promise<void> {
    // Init collections
    await this.userModel.createCollection();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email, isDeleted: false });
  }

  async findByIDEmailAndPassword(
    _id: string,
    email: string,
    password: string,
  ): Promise<User | null> {
    return this.userModel.findOne({ _id, password, email, isDeleted: false });
  }

  async invalidPassword(user: User, password: string): Promise<boolean> {
    if (!user) {
      return true;
    }

    return !(await user.authenticatePassword(password));
  }

  async findUserByID(_id: string): Promise<User | null> {
    return this.userModel.findOne({ _id, isDeleted: false });
  }

  async updateUser(user: User, update: Partial<User>): Promise<User> {
    merge(user, update);

    return user.save();
  }

  async createSingleUser(
    user: User,
    writeSession?: WriteSession,
  ): Promise<User> {
    if (writeSession) {
      const session = writeSession.getSession();
      const [createdUser] = await this.userModel.create([user], { session });

      return createdUser;
    }

    return this.userModel.create(user);
  }

  jsonUser(user: User): LeanUser {
    return user.toJSON();
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
    return this.jsonUser(await this.updateUser(user, update));
  }

  async deleteUser(user: User): Promise<LeanUser> {
    this.logger.setMethodName('deleteUser').info('deleting user account');
    return this.jsonUser(await this.updateUser(user, { isDeleted: true }));
  }
}
