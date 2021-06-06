import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { CreateSchoolDTO } from './create.dto';

export class UpdateSchoolDTO extends CreateSchoolDTO {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  name: string;
}
