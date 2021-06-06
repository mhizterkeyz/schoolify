import { PickType } from '@nestjs/swagger';

import { School } from '../schema/school.schema';

export class CreateSchoolDTO extends PickType(School, [
  'name',
  'email',
  'phonenumber',
  'slug',
]) {}
