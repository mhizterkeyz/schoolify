import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { ValidateWithService } from '@src/decorators/validation/service-validation.decorator';
import { CreateSchoolDTO } from './create.dto';

export class UpdateSchoolDTO extends CreateSchoolDTO {
  @ApiProperty({ description: 'school name' })
  @IsString()
  @IsOptional()
  @ValidateWithService({
    serviceName: 'SchoolService',
    methodName: 'validateSchoolName',
  })
  name: string;
}
