import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { USER } from '@src/constants';
import { CommonServiceMethods } from '@src/util/common/common.service.methods';
import { Logger } from '@src/logger/logger.service';
import { ValidateWithServiceResponse } from '@src/decorators/validation/service-validation.decorator';
import { LeanUser, UpdateUserPayload, User } from './schema/user.schema';

@Injectable()
export class UserService extends CommonServiceMethods<User> {
  constructor(
    @InjectModel(USER) private readonly userModel: Model<User>,
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
    await this.updateDocument(user, update);
    return user.toJSON();
  }

  async deleteUser(user: User): Promise<LeanUser> {
    this.logger.setMethodName('deleteUser').info('deleting user account');
    await this.updateDocument(user, { isDeleted: true });
    return user.toJSON();
  }

  async findByIDEmailAndPassword(
    _id: string,
    email: string,
    password: string,
  ): Promise<User> {
    return this.userModel.findOne({ _id, email, password, isDeleted: false });
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email, isDeleted: false });
  }

  async validateUserEmail(email: string): Promise<ValidateWithServiceResponse> {
    const emailExists = await this.userModel.exists({
      email,
      isDeleted: false,
    });

    return { isValid: !emailExists, message: 'user with email exists' };
  }
}
