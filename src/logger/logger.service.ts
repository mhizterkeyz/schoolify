import { Injectable, Logger as NestLogger } from '@nestjs/common';
import { APPLICATION_NAME } from '@src/constants';

@Injectable()
export class Logger extends NestLogger {
  context = APPLICATION_NAME;

  info(message: string, context?: string): void {
    super.log(message, context);
  }
}
