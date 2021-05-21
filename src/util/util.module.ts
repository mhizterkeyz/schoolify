import { Module, Global } from '@nestjs/common';

import { MongoosePaginationService } from './pagination.service';
import { ResponseService } from './response.service';

@Global()
@Module({
  providers: [MongoosePaginationService, ResponseService],
  exports: [MongoosePaginationService, ResponseService],
})
export class UtilModule {}
