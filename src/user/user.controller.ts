import { Controller } from '@nestjs/common';

import { Logger } from '@src/logger';
import { ResponseService } from '@src/util';

@Controller('users')
export class UserController {
  constructor(
    private readonly logger: Logger,
    private readonly responseService: ResponseService,
  ) {
    this.logger.setContext(UserController.name);
  }
}
