import { Module, Global } from '@nestjs/common';

import { MongoosePaginationService } from './pagination.service';
import { ResponseService } from './response.service';
import { UtilService } from './util.service';

@Global()
@Module({
  providers: [MongoosePaginationService, ResponseService, UtilService],
  exports: [MongoosePaginationService, ResponseService, UtilService],
})
export class UtilModule {}
