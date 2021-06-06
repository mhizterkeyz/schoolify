import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@src/decorators';
import { CurrentSchool } from '@src/decorators/current-school.decorator';
import { EmailVerified, JWTAuthGuard } from '@src/guards';
import { User } from '@src/user';
import {
  CommonResponse,
  PaginationFilter,
  ResponseDTO,
  ResponseObject,
  ResponseService,
} from '@src/util';
import { CreateSchoolDTO } from './dto';
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
}
