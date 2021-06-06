import { Injectable } from '@nestjs/common';
import { Model, Document, FilterQuery } from 'mongoose';
import { cloneDeep, isEmpty } from 'lodash';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@Injectable()
export class MongoosePaginationService {
  async paginate<T extends Document>(
    model: Model<T>,
    criteria: FilterQuery<Model<Document>>,
    page = 1,
    limit = 10,
    populate: any[] | Record<string, unknown> = [],
    sort = { createdAt: -1 },
  ): Promise<PaginationResult<T>> {
    const pagination: { page: number; limit: number } = {
      page: Math.ceil(page),
      limit: Math.ceil(limit),
    };
    let result: T[] = [];
    let prevPage: number | boolean;
    let nextPage: number | boolean;

    const params: any = criteria || { isDeleted: { $ne: true } };
    const count: number = await model.countDocuments(params);
    const totalPage = Math.ceil(count / pagination.limit);
    if (
      pagination.page >= 1 &&
      pagination.limit >= 1 &&
      totalPage >= pagination.page
    ) {
      const skip = limit * (pagination.page - 1);
      const query = model
        .find(params)
        .skip(skip)
        .sort(sort)
        .limit(pagination.limit);
      if (
        populate &&
        typeof populate === 'object' &&
        !Array.isArray(populate)
      ) {
        query.populate(populate);
      }
      if (!isEmpty(populate) && Array.isArray(populate)) {
        populate.forEach(p => {
          query.populate(p);
        });
      }
      result = (await query) as T[];

      prevPage = pagination.page - 1 > 0 ? pagination.page - 1 : false;
      nextPage = pagination.page + 1 > totalPage ? false : pagination.page + 1;
    }

    return {
      data: result,
      metadata: {
        page: pagination.page,
        perPage: pagination.limit,
        total: count,
        pageCount: result.length,
        previousPage: prevPage || false,
        nextPage: nextPage || false,
      },
    };
  }

  async aggregatePaginate<T>(
    model: Model<Document>,
    criteria: any[],
    page = 1,
    limit = 10,
  ): Promise<AggregatePaginationResult<T>> {
    const pagination: { page: number; limit: number } = {
      page: Math.ceil(page),
      limit: Math.ceil(limit),
    };
    let result: T[] = [];
    let prevPage: number | boolean;
    let nextPage: number | boolean;

    const params: any = cloneDeep(criteria);
    let count = 0;
    const resTotal = await model.aggregate(params).count('total');
    if (resTotal.length > 0) {
      count = resTotal[0].total;
    }

    const totalPage = Math.ceil(count / pagination.limit);
    if (
      pagination.page >= 1 &&
      pagination.limit >= 1 &&
      totalPage >= pagination.page
    ) {
      const skip = limit * (pagination.page - 1);
      const query = model
        .aggregate(criteria)
        .skip(skip)
        .limit(pagination.limit);

      result = (await query) as T[];

      prevPage = pagination.page - 1 > 0 ? pagination.page - 1 : false;
      nextPage = pagination.page + 1 > totalPage ? false : pagination.page + 1;
    }

    return {
      data: result,
      metadata: {
        page: pagination.page,
        perPage: pagination.limit,
        total: count,
        pageCount: result.length,
        previousPage: prevPage || false,
        nextPage: nextPage || false,
      },
    };
  }
}

export class PaginationMetaData {
  @ApiProperty({ description: 'current page' })
  page: number;

  @ApiProperty({ description: 'results per page' })
  perPage: number;

  @ApiProperty({ description: 'total results' })
  total: number;

  @ApiProperty({ description: 'previous page' })
  previousPage: number | boolean;

  @ApiProperty({ description: 'next page' })
  nextPage: number | boolean;

  @ApiProperty({ description: 'number of pages' })
  pageCount: number;
}

export class PaginationFilter {
  @ApiProperty({
    description: 'number of results per page',
    example: 10,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  perPage?: number;

  @ApiProperty({ description: 'page', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: 'search query',
    example: 'school-slug',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
}
export interface PaginationResult<T extends Document> {
  data: T[];
  metadata: PaginationMetaData;
}

export interface AggregatePaginationResult<T> {
  data: T[];
  metadata: PaginationMetaData;
}
