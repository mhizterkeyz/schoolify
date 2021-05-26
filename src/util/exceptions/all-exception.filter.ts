import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { APPLICATION_NAME } from '@src/constants';

import { Logger } from '@src/logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const logger = new Logger(APPLICATION_NAME);

    // eslint-disable-next-line no-console
    logger.error(exception.message, exception.stack);
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? (exception as HttpException).getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isHttpException
      ? exception.message
      : 'Something went wrong';

    response.status(status).json({
      status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
