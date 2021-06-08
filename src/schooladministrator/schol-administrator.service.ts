import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { SCHOOL_ADMINISTRATOR } from '@src/constants';
import { CommonServiceMethods } from '@src/util';
import { SchoolAdministrator } from './schema';

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
}
