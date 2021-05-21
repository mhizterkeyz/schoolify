import { Module, Global } from '@nestjs/common';

import { APPLICATION_NAME, LOGGER } from '@src/constants';
import { Logger } from './logger.service';

@Global()
@Module({
  providers: [
    {
      provide: LOGGER,
      useFactory: (): Logger => {
        return new Logger({
          application: APPLICATION_NAME,
          logLevel: 'Application',
        });
      },
    },
  ],
  exports: [LOGGER],
})
export class LoggerModule {}
