/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/ban-types */
import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { PaginationMetaData } from '../pagination.service';

type Constructor<T = Record<string, any>> = new (...args: any[]) => T;
type ResponseDTOType =
  | string
  | Function
  | Record<string, any>
  | Type<unknown>
  | [Function];
type ResponseType = 'withMeta' | 'withData' | 'withDataAndMeta';

export function ResponseDTO<TBase extends ResponseDTOType>({
  base,
  type,
}: {
  base?: TBase | TBase[];
  type?: ResponseType;
}): Constructor {
  const classes: Record<string, Constructor> = {};

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
      type: base,
    })
    data: TBase;
  }

  class ResponseWithDataAndMeta extends ResponseWithMeta {
    @ApiProperty({
      type: base,
    })
    data: TBase;
  }

  if (base) {
    // eslint-disable-next-line no-param-reassign
    type = 'withData';
  }

  // @ts-ignore
  const name = Array.isArray(base) ? base[0].name : base.name || 'Response';
  switch (type) {
    case 'withMeta': {
      classes[name] = ResponseWithMeta;
      break;
    }
    case 'withData': {
      classes[name] = ResponseWithData;
      break;
    }
    case 'withDataAndMeta': {
      classes[name] = ResponseWithDataAndMeta;
      break;
    }
    default: {
      classes[name] = Response;
    }
  }

  return classes[name];
}
