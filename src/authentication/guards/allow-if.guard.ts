import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AllowIfArg } from '../decorators/allow-if.decorator';

interface IGuardData {
  canActivate: boolean;
  error: Error;
}

@Injectable()
export class AllowIfGuard {
  private request: any;

  constructor(private readonly reflector: Reflector) {}

  private getGuardData(name: string): IGuardData {
    return this.request[`allow-if-${name}`];
  }

  private conditionIsString(condition: AllowIfArg): boolean {
    if (typeof condition !== 'string') {
      if (Array.isArray(condition)) {
        condition.forEach(this.processAndConditions.bind(this));
      } else {
        const [operator] = Object.keys(condition);
        const [operands] = Object.values(condition);
        switch (operator) {
          case '$or': {
            this.processOrConditions(operands);
            break;
          }
          default: {
            operands.forEach(this.processAndConditions.bind(this));
          }
        }
      }

      return false;
    }
    return true;
  }

  private processOrConditions(conditions: AllowIfArg[]): void {
    let gd: IGuardData;
    const badValue = conditions.some(condition => {
      if (this.conditionIsString(condition)) {
        const guardData = this.getGuardData(condition as string);
        gd = guardData;
        return guardData.canActivate;
      }

      return false;
    });
    if (!badValue) {
      throw gd.error;
    }
  }

  private processAndConditions(condition: AllowIfArg): void {
    if (this.conditionIsString(condition)) {
      const guardData = this.getGuardData(condition as string);
      if (!guardData.canActivate) {
        throw guardData.error;
      }
    }
  }

  canActivate(context: ExecutionContext): boolean {
    this.request = context.switchToHttp().getRequest();
    const allowIf = this.reflector.get<AllowIfArg[]>(
      'allow-if',
      context.getHandler(),
    );
    allowIf.forEach(this.processAndConditions.bind(this));

    return true;
  }
}
