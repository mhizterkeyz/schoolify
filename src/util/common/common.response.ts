import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';

class InternalServerError {
  @ApiProperty({
    description: 'status',
    example: 500,
  })
  status: number;

  @ApiProperty({
    description: 'message',
    example: 'Something went wrong',
  })
  message: string;

  @ApiProperty({
    description: 'timestamp',
    example: new Date(),
  })
  timestamp: Date;

  @ApiProperty({
    description: 'request url',
    example: '/error',
  })
  path: string;
}

class UnprocessibleEntity extends InternalServerError {
  @ApiProperty({
    description: 'status',
    example: 422,
  })
  status: number;

  @ApiProperty({
    description: 'message',
    example: 'Validation Error',
  })
  message: string;

  @ApiProperty({
    description: 'validation errors',
    example: { propertyName: 'error' },
  })
  errors: Record<string, unknown>;
}

class BadRequest extends InternalServerError {
  @ApiProperty({
    description: 'status',
    example: 400,
  })
  status: number;

  @ApiProperty({
    description: 'message',
    example: 'Bad Request',
  })
  message: string;
}

class ConflictError extends InternalServerError {
  @ApiProperty({
    description: 'status',
    example: 409,
  })
  status: number;

  @ApiProperty({
    description: 'message',
    example: 'Conflict',
  })
  message: string;
}

class UnauthorizedError extends InternalServerError {
  @ApiProperty({
    description: 'status',
    example: 401,
  })
  status: number;

  @ApiProperty({
    description: 'message',
    example: 'Unauthorized',
  })
  message: string;
}

class NotFoundError extends InternalServerError {
  @ApiProperty({
    description: 'status',
    example: 404,
  })
  status: number;

  @ApiProperty({
    description: 'message',
    example: 'NotFound',
  })
  message: string;
}

class ForbiddenError extends InternalServerError {
  @ApiProperty({
    description: 'status',
    example: 403,
  })
  status: number;

  @ApiProperty({
    description: 'message',
    example: 'Forbidden',
  })
  message: string;
}

export type IFunction = <T, K>(...args: K[]) => T;
export type ApplyDecorators = <TFunction extends IFunction, Y>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  target: object | TFunction,
  propertyKey?: string | symbol,
  descriptor?: TypedPropertyDescriptor<Y>,
) => void;

type commonResponse = 400 | 500 | 422 | 409 | 401 | 404 | 403;

export const CommonResponse = (
  responses?: Partial<Record<commonResponse, string>>,
  ommits: Partial<commonResponse[]> = [],
): ApplyDecorators => {
  const decorators = [];
  const resp = {
    500: 'Internal server error',
    422: 'Validation error',
    ...(responses || {}),
  };
  ommits.forEach(ommit => {
    delete resp[ommit];
  });

  Object.keys(resp).forEach(response => {
    switch (+response) {
      case 500: {
        decorators.push(
          ApiResponse({
            type: InternalServerError,
            description: resp[response],
            status: +response,
          }),
        );
        break;
      }
      case 422: {
        decorators.push(
          ApiResponse({
            type: UnprocessibleEntity,
            description: resp[response],
            status: +response,
          }),
        );
        break;
      }
      case 400: {
        decorators.push(
          ApiResponse({
            type: BadRequest,
            description: resp[response],
            status: +response,
          }),
        );
        break;
      }
      case 409: {
        decorators.push(
          ApiResponse({
            type: ConflictError,
            description: resp[response],
            status: +response,
          }),
        );
        break;
      }
      case 401: {
        decorators.push(
          ApiResponse({
            type: UnauthorizedError,
            description: resp[response],
            status: +response,
          }),
        );
        break;
      }
      case 404: {
        decorators.push(
          ApiResponse({
            type: NotFoundError,
            description: resp[response],
            status: +response,
          }),
        );
        break;
      }
      case 403: {
        decorators.push(
          ApiResponse({
            type: ForbiddenError,
            description: resp[response],
            status: +response,
          }),
        );
        break;
      }
      default:
      // invalid response code
    }
  });

  return applyDecorators(...decorators);
};
