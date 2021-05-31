import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SCHOOL } from '@src/constants';
import { SchoolSchema } from './schema/school.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SCHOOL, schema: SchoolSchema }]),
  ],
})
export class SchoolModule {}
