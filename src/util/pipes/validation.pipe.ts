import { ValidationError, ValidationPipe as VP } from '@nestjs/common';
import { ValidationException } from '../exceptions/validation.exception';

export class ValidationPipe extends VP {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const formatErrors = (errorsToFromat: ValidationError[]) => {
          return errorsToFromat.reduce(
            (accumulator: Record<string, unknown>, error: ValidationError) => {
              let constraints: any;
              if (Array.isArray(error.children) && error.children.length) {
                constraints = formatErrors(error.children);
              } else {
                constraints =
                  (error.constraints &&
                    Object.values(error.constraints).join(', ')) ||
                  '';
              }
              return {
                ...accumulator,
                [error.property]: constraints,
              };
            },
            {},
          );
        };
        const messages = formatErrors(errors);

        return new ValidationException(messages);
      },
    });
  }
}
