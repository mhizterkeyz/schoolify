import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { SCHOOL_ADMINISTRATOR } from '@src/constants';
import { CommonServiceMethods } from '@src/util/common/common.service.methods';
import { SchoolAdministrator } from './schema/school-administrator.schema';

@Injectable()
export class SchoolAdministratorService extends CommonServiceMethods<
  SchoolAdministrator
> {
  constructor(
    @InjectModel(SCHOOL_ADMINISTRATOR)
    private readonly schoolAdministratorModel: Model<SchoolAdministrator>,
  ) {
    super(schoolAdministratorModel);
  }

  async deleteManyBySchoolId(
    school: string,
    session: ClientSession = null,
  ): Promise<void> {
    await this.schoolAdministratorModel.updateMany(
      { school, isDeleted: false },
      { isDeleted: true },
      { session },
    );
  }

  async getByUserId(userId: string): Promise<SchoolAdministrator[]> {
    return this.schoolAdministratorModel.find({
      user: userId,
      isDeleted: false,
    });
  }
}
