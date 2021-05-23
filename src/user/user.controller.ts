import { Controller, Inject } from '@nestjs/common';

import { APPLICATION_NAME, LOGGER } from '@src/constants';
import { Logger } from '@src/logger';
import { ResponseService } from '@src/util';

@Controller('users')
export class UserController {
  private logger: Logger;

  constructor(
    @Inject(LOGGER) logger: Logger,
    private readonly responseService: ResponseService,
  ) {
    this.logger = logger.child({
      logLevel: 'UserController',
      application: APPLICATION_NAME,
    });
  }
}
