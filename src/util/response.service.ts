import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiProperty } from '@nestjs/swagger';
import { isNil } from 'lodash';

import { PaginationMetaData } from './pagination.service';

export class ResponseObject<T> {
  @ApiProperty({
    description: 'Response Message',
  })
  message?: string;

  @ApiProperty({
    description: 'Response Data',
  })
  data?: T;

  @ApiProperty({
    description: 'Pagination Meta',
  })
  meta?: any;
}

@Injectable()
export class ResponseService {
  constructor(private configService: ConfigService) {}

  json<T>(
    message?: string,
    data?: T,
    meta?: PaginationMetaData,
  ): ResponseObject<T> {
    const responseObj: ResponseObject<T> = {};
    responseObj.message = message;

    if (!isNil(data)) {
      responseObj.data = data;
    }
    if (!isNil(meta)) {
      responseObj.meta = meta;
    }

    return responseObj;
  }
}
