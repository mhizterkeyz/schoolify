import {
  applyDecorators,
  CanActivate,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';

import { ApplyDecorators } from '@src/util';
import { AllowIfGuard } from '../guards/allow-if.guard';
import { EmailVerified } from '../guards/email-verified';
import { UseJWT } from './use-jwt.decorator';

export type AllowIfOperands = 'email-verified';
export type AllowIfOperators = '$and' | '$or';
export type AllowIfArg =
  | AllowIfOperands
  | Partial<Record<AllowIfOperators, AllowIfArg[]>>;

// eslint-disable-next-line @typescript-eslint/ban-types
const allowIfGuards: Record<AllowIfOperands, Function | CanActivate> = {
  'email-verified': EmailVerified,
};

export const AllowIf = (...args: AllowIfArg[]): ApplyDecorators => {
  const allowOperands: AllowIfOperands[] = [];
  const guards: (ClassDecorator | MethodDecorator | PropertyDecorator)[] = [];
  const spreadAllowOperands = (allowOperand: AllowIfArg | AllowIfArg[]) => {
    if (typeof allowOperand !== 'string') {
      if (Array.isArray(allowOperand)) {
        allowOperand.forEach(spreadAllowOperands);
      } else {
        const [operands] = Object.values(allowOperand);
        spreadAllowOperands(operands as any);
      }
      return;
    }

    allowOperands.push(allowOperand as AllowIfOperands);
  };
  args.forEach(spreadAllowOperands);

  Object.keys(allowIfGuards).forEach(key => {
    if (allowOperands.includes(key as AllowIfOperands)) {
      guards.push(UseGuards(allowIfGuards[key]));
    }
  });

  return applyDecorators(
    SetMetadata('allow-conditions', allowOperands),
    SetMetadata('allow-if', args),
    UseJWT(),
    ...guards,
    UseGuards(AllowIfGuard),
  );
};
