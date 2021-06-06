import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import {
  ModelMethods,
  MongoosePaginationService,
  PaginationFilter,
  PaginationResult,
  UtilService,
} from '@src/util';
import { SCHOOL } from '@src/constants';
import { User } from '@src/user';
import { School } from './schema/school.schema';
import { CreateSchoolDTO } from './dto';
import { UpdateSchoolDTO } from './dto/update.dto';

class SchoolModelMethods extends ModelMethods<School> {
  constructor(schoolModel: Model<School>) {
    super(schoolModel);
  }

  async findSchoolByName(name: string): Promise<School> {
    return this.model.findOne({ name, isDeleted: false });
  }

  async findByEitherIdNameOrSlugOrFail(IdNameOrSlug: string): Promise<School> {
    const $or: any[] = [{ name: IdNameOrSlug }, { slug: IdNameOrSlug }];
    if (isValidObjectId(IdNameOrSlug)) {
      $or.push({ _id: IdNameOrSlug });
    }

    const school = await this.model.findOne({ $or });
    if (!school) {
      throw new NotFoundException('school not found');
    }

    return school;
  }

  async findSchoolBySlug(slug: string): Promise<School> {
    return this.model.findOne({ slug, isDeleted: false });
  }
}
@Injectable()
export class SchoolService extends SchoolModelMethods {
  constructor(
    @InjectModel(SCHOOL) model: Model<School>,
    private readonly utilService: UtilService,
    private readonly paginationService: MongoosePaginationService,
  ) {
    super(model);
  }

  async createSchool(
    user: User,
    createSchoolDTO: CreateSchoolDTO,
  ): Promise<School> {
    const { name } = createSchoolDTO;
    const slug = createSchoolDTO.slug || this.utilService.slugify(name);
    const schoolNameExists = !!(await this.findSchoolByName(name));
    if (schoolNameExists) {
      throw new ConflictException('school name already taken');
    }

    const schoolSlugExists = !!(await this.findSchoolBySlug(slug));
    if (schoolSlugExists) {
      throw new ConflictException('school slug already taken');
    }

    return this.create(({
      owner: user,
      slug,
      ...createSchoolDTO,
    } as unknown) as School);
  }

  updateSchool(
    school: School,
    updateSchoolDTO: UpdateSchoolDTO,
  ): Promise<School> {
    return this.updateOne(school, updateSchoolDTO);
  }

  deleteSchool(school: School): Promise<School> {
    return this.deleteOne(school);
  }

  getSchools(
    paginationFilter: PaginationFilter,
  ): Promise<PaginationResult<School>> {
    const { search = '', perPage = 100, page = 1 } = paginationFilter;
    const query: FilterQuery<School> = { isDeleted: false };
    if (search.length) {
      query.$or = [
        { name: { $regex: search, $options: 'gi' } },
        { slug: { $regex: search, $options: 'gi' } },
      ];
    }

    return this.paginationService.paginate<School>(
      this.model,
      query,
      page,
      perPage,
    );
  }
}
