import { Module, Global } from '@nestjs/common';

import { LOGGER } from '@src/constants';
import { Logger } from './logger.service';

@Global()
@Module({
  providers: [Logger],
  exports: [LOGGER],
})
export class LoggerModule {}
