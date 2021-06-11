import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions as VO,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

interface ValidationOptions extends VO {
  serviceName: string;
  methodName: string;
}

export interface ValidateWithServiceResponse {
  message: string;
  isValid: boolean;
}

@ValidatorConstraint({ async: true })
@Injectable()
export class ValidateWithServiceConstraint
  implements ValidatorConstraintInterface {
  private message: string;

  constructor(private readonly moduleRef: ModuleRef) {}

  async validate(value: unknown, args?: ValidationArguments): Promise<boolean> {
    const [{ serviceName, methodName }] = args.constraints;
    const service = this.moduleRef.get(serviceName, { strict: false });
    const res = await service[methodName](value);
    const isValid = res.isValid || false;
    this.message = res.message || 'invalid value';

    return isValid;
  }

  defaultMessage(): string {
    return this.message;
  }
}

export const ValidateWithService = (validationOptions: ValidationOptions) => {
  return (object: unknown, propertyName: string): void => {
    registerDecorator({
      name: 'ValidateWithService',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: ValidateWithServiceConstraint,
      constraints: [validationOptions],
    });
  };
};
