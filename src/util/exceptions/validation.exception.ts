import { BadRequestException, HttpStatus } from '@nestjs/common';

export class ValidationException extends BadRequestException {
  constructor(public validationErrors: Record<string, unknown>) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, 'Validation Error');
  }
}
