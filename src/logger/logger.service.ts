import { Injectable, Logger as NestLogger, Scope } from '@nestjs/common';
import { APPLICATION_NAME } from '@src/constants';

@Injectable({ scope: Scope.TRANSIENT })
export class Logger extends NestLogger {
  private originalContext = APPLICATION_NAME;

  constructor(context = APPLICATION_NAME, isTimestampEnabled?: boolean) {
    super(context, isTimestampEnabled);
  }

  setMethodName(methodName: string): Logger {
    this.context = `${this.originalContext}.${methodName}`;

    return this;
  }

  setContext(context: string): void {
    this.originalContext = context;
    super.setContext(context);
  }

  info(message: string, context?: string): void {
    super.log(message, context);
  }
}
