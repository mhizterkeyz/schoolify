import { applyDecorators } from '@nestjs/common';
import { Schema, SchemaOptions } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

import { ApplyDecorators } from './common.response';

export const BaseSchema = (options?: SchemaOptions): ApplyDecorators => {
  return applyDecorators(
    Schema(
      options || {
        timestamps: true,
        toJSON: {
          virtuals: true,
          transform: (_doc: any, ret: any): void => {
            delete ret._id;
            delete ret.__v;
            delete ret.password;
          },
        },
        toObject: {
          virtuals: true,
        },
      },
    ),
  );
};

export class BaseModel extends Document {
  @ApiProperty({
    type: String,
    description: 'virtual id',
  })
  id?: string;

  @ApiProperty({
    description: 'doc createdAt',
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'doc updatedAt',
  })
  updatedAt?: Date;
}
