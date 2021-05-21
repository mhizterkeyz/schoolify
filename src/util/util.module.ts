import { Module, Global } from '@nestjs/common';

import { MongoosePaginationService } from './pagination.service';

@Global()
@Module({
  providers: [MongoosePaginationService],
  exports: [MongoosePaginationService],
})
export class UtilModule {}
