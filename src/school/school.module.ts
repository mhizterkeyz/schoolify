import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SCHOOL } from '@src/constants';
import { SchoolSchema } from './schema/school.schema';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SCHOOL, schema: SchoolSchema }]),
  ],
  controllers: [SchoolController],
  providers: [SchoolService],
  exports: [SchoolService],
})
export class SchoolModule {}
