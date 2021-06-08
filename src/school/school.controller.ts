import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentSchool } from '@src/decorators/current-school.decorator';
import { CurrentUser } from '@src/decorators/current-user.decorator';
import { SchoolAdministrator } from '@src/decorators/school-administrator.decorator';
import { EmailVerified } from '@src/guards/email-verified';
import { JWTAuthGuard } from '@src/guards/jwt.guaurd';
import { User } from '@src/user/schema/user.schema';
import { CommonResponse } from '@src/util/common/common.response';
import { ResponseDTO } from '@src/util/common/response.dto';
import { PaginationFilter } from '@src/util/pagination.service';
import { ResponseObject, ResponseService } from '@src/util/response.service';
import { CreateSchoolDTO } from './dto/create.dto';
import { UpdateSchoolDTO } from './dto/update.dto';
import { School } from './schema/school.schema';
import { SchoolService } from './school.service';

@Controller('schools')
@ApiTags('Schools')
export class SchoolController {
  constructor(
    private readonly schoolService: SchoolService,
    private readonly reponseService: ResponseService,
  ) {}

  @ApiOperation({ summary: 'create new school' })
  @ApiResponse({
    type: ResponseDTO(School).SchoolResponse,
    status: 201,
    description: 'school created',
  })
  @CommonResponse({ 409: 'school name/slug is already taken' })
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard, EmailVerified)
  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createSchoolDTO: CreateSchoolDTO,
  ): Promise<ResponseObject<School>> {
    const school = await this.schoolService.createSchool(user, createSchoolDTO);

    return this.reponseService.json('school created successfully', school);
  }

  @ApiOperation({ summary: 'get list of schools' })
  @ApiResponse({
    type: ResponseDTO([School]).SchoolsResponse,
    description: 'schools retrieved successfully',
    status: 200,
  })
  @CommonResponse()
  @Get()
  async findSchools(
    @Query() paginationFilter: PaginationFilter,
  ): Promise<ResponseObject<School[]>> {
    const { metadata, data } = await this.schoolService.getSchools(
      paginationFilter,
    );

    return this.reponseService.json(
      'schools retrieved successfully',
      data,
      metadata,
    );
  }

  @ApiOperation({ summary: 'get school by slug or id' })
  @ApiResponse({
    type: ResponseDTO(School).SchoolResponse,
    status: 200,
    description: 'school found',
  })
  @CommonResponse({ 404: 'school not found' }, [422])
  @ApiParam({ name: 'school' })
  @Get(':school')
  findSchool(@CurrentSchool() school: School): ResponseObject<School> {
    return this.reponseService.json(`school found successfully`, school);
  }

  @ApiOperation({ summary: 'update school' })
  @ApiResponse({
    type: ResponseDTO(School).SchoolResponse,
    status: 200,
    description: 'school updated',
  })
  @CommonResponse({
    404: 'school not found',
    403: 'does not have permission',
    409: 'schol name/slug already exists',
  })
  @ApiParam({ name: 'school' })
  @SchoolAdministrator('can.update.school')
  @Put(':school')
  async updateSchool(
    @CurrentSchool() school: School,
    @Body() updateSchoolDTO: UpdateSchoolDTO,
  ): Promise<ResponseObject<School>> {
    const updatedSchool = await this.schoolService.updateSchool(
      school,
      updateSchoolDTO,
    );

    return this.reponseService.json('school updated', updatedSchool);
  }

  @ApiOperation({ summary: 'delete school' })
  @ApiResponse({
    type: ResponseDTO(School).SchoolResponse,
    status: 200,
    description: 'school deleted',
  })
  @CommonResponse(
    { 404: 'school not found', 403: 'does not have permission' },
    [422],
  )
  @ApiParam({ name: 'school' })
  @SchoolAdministrator('can.delete.school')
  @Delete(':school')
  async deleteSchool(
    @CurrentSchool() school: School,
  ): Promise<ResponseObject<School>> {
    const deletedSchool = await this.schoolService.deleteSchool(school);

    return this.reponseService.json('school deleted', deletedSchool);
  }
}
