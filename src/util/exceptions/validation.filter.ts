import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ValidationException } from './validation.exception';

@Catch(ValidationException)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = HttpStatus.UNPROCESSABLE_ENTITY;

    response.status(status).json({
      status,
      message: 'Validation Error',
      errors: exception.validationErrors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
