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
                const hasContraints = !!error.constraints;
                if (hasContraints) {
                  let items = Object.values(error.constraints);
                  const lastItem = items.pop();
                  items = [items.join(', '), lastItem].filter(item => item);
                  constraints = items.join(' and ');
                } else {
                  constraints = '';
                }
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
