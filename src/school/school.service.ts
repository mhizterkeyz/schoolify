import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { ModelMethods } from '@src/util';
import { School } from './schema/school.schema';

class SchoolModelMethods extends ModelMethods<School> {
  constructor(schoolModel: Model<School>) {
    super(schoolModel);
  }
}
@Injectable()
export class SchoolService extends SchoolModelMethods {}
