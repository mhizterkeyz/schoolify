import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SCHOOL_ADMINISTRATOR } from '@src/constants';
import { SchoolAdministratorSchema } from './schema';
import { SchoolAdministratorService } from './schol-administrator.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SCHOOL_ADMINISTRATOR, schema: SchoolAdministratorSchema },
    ]),
  ],
  providers: [SchoolAdministratorService],
  exports: [SchoolAdministratorService],
})
export class SchoolAdministratorModule {}
