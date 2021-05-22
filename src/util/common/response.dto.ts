import { ApiProperty } from '@nestjs/swagger';

import { PaginationMetaData } from '../pagination.service';

type Constructor<T = Record<string, any>> = new (...args: any[]) => T;

export function ResponseDTO<TBase extends Constructor>(
  Base?: TBase | TBase[],
): {
  response: Constructor;
  responseWithMeta: Constructor;
  responseWithData: Constructor;
  responseWithDataAndMeta: Constructor;
} {
  class Response {
    @ApiProperty({
      type: String,
    })
    message: string;
  }

  class ResponseWithMeta extends Response {
    @ApiProperty({
      type: PaginationMetaData,
    })
    meta: PaginationMetaData;
  }

  class ResponseWithData extends Response {
    @ApiProperty({
      type: Base,
    })
    data: TBase;
  }

  class ResponseWithDataAndMeta extends ResponseWithMeta {
    @ApiProperty({
      type: Base,
    })
    data: TBase;
  }

  return {
    response: Response,
    responseWithData: ResponseWithData,
    responseWithDataAndMeta: ResponseWithDataAndMeta,
    responseWithMeta: ResponseWithMeta,
  };
}
