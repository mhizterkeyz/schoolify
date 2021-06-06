/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/ban-types */
import { Type } from '@nestjs/common';
import { ApiProperty, OmitType } from '@nestjs/swagger';

import { PaginationMetaData } from '../pagination.service';

type Constructor<T = Record<string, any>> = new (...args: any[]) => T;
type ResponseDTOType =
  | string
  | Function
  | Record<string, any>
  | Type<unknown>
  | [Function];

interface IResponseDTO {
  LoggedInUserResponse: Constructor;
  SchoolsResponse: Constructor;
  LeanUserResponse: Constructor;
  SchoolResponse: Constructor;
  Response: Constructor;
}

export function ResponseDTO<TBase extends ResponseDTOType>(
  Base?: TBase | TBase[],
): IResponseDTO {
  class Response {
    @ApiProperty()
    message: string;

    @ApiProperty({ type: Base })
    data: TBase;

    @ApiProperty({ type: PaginationMetaData })
    meta: PaginationMetaData;
  }

  class ResponseWithData extends OmitType(Response, ['meta']) {}

  class ResponseWithMeta extends Response {}

  class LoggedInUserResponse extends ResponseWithData {}
  class SchoolsResponse extends ResponseWithMeta {}
  class LeanUserResponse extends ResponseWithData {}
  class SchoolResponse extends ResponseWithData {}

  return {
    LoggedInUserResponse,
    SchoolsResponse,
    LeanUserResponse,
    SchoolResponse,
    Response,
  };
}
