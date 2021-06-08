import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Connection, FilterQuery, isValidObjectId, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';

import { SCHOOL } from '@src/constants';
import { CommonServiceMethods } from '@src/util/common/common.service.methods';
import { UtilService } from '@src/util/util.service';
import {
  MongoosePaginationService,
  PaginationFilter,
  PaginationResult,
} from '@src/util/pagination.service';
import { SchoolAdministratorService } from '@src/schooladministrator/schol-administrator.service';
import { SchoolAdministrator } from '@src/schooladministrator/schema/school-administrator.schema';
import { User } from '@src/user/schema/user.schema';
import { School } from './schema/school.schema';
import { UpdateSchoolDTO } from './dto/update.dto';
import { CreateSchoolDTO } from './dto/create.dto';

@Injectable()
export class SchoolService extends CommonServiceMethods<School> {
  constructor(
    @InjectModel(SCHOOL) private readonly schoolModel: Model<School>,
    @InjectConnection() private readonly connection: Connection,
    private readonly utilService: UtilService,
    private readonly paginationService: MongoosePaginationService,
    private readonly schoolAdministratorService: SchoolAdministratorService,
  ) {
    super(schoolModel);
  }

  async createSchool(
    user: User,
    createSchoolDTO: CreateSchoolDTO,
  ): Promise<School> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const { name } = createSchoolDTO;
      const slug = createSchoolDTO.slug || this.utilService.slugify(name);
      await this.failIfDuplicateSchoolName(name);
      await this.failIfDuplicateSchoolSlug(slug);

      const [school] = await this.schoolModel.create(
        [
          {
            slug,
            ...createSchoolDTO,
          },
        ],
        { session },
      );
      await this.schoolAdministratorService.create(
        {
          user,
          isOwner: true,
          school,
        } as SchoolAdministrator,
        session,
      );
      await session.commitTransaction();

      return school;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateSchool(
    school: School,
    updateSchoolDTO: UpdateSchoolDTO,
  ): Promise<School> {
    const { name, slug } = updateSchoolDTO;
    if (name) {
      await this.failIfDuplicateSchoolName(name);
    }
    if (slug) {
      await this.failIfDuplicateSchoolSlug(slug);
    }

    return this.updateDocument(school, updateSchoolDTO);
  }

  async deleteSchool(school: School): Promise<School> {
    const session = await this.connection.startSession();
    await session.startTransaction();
    try {
      await this.schoolAdministratorService.deleteManyBySchoolId(
        school.id,
        session,
      );
      const deletedSchool = await this.updateDocument(
        school,
        { isDeleted: true },
        session,
      );
      await session.commitTransaction();

      return deletedSchool;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async failIfDuplicateSchoolName(name: string): Promise<void> {
    const schoolNameExists = await this.schoolModel.exists({
      name,
      isDeleted: false,
    });
    if (schoolNameExists) {
      throw new ConflictException('school name already taken');
    }
  }

  async failIfDuplicateSchoolSlug(slug: string): Promise<void> {
    const schoolSlugExists = await this.schoolModel.exists({
      slug,
      isDeleted: false,
    });
    if (schoolSlugExists) {
      throw new ConflictException('school slug already taken');
    }
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
      this.schoolModel,
      query,
      page,
      perPage,
    );
  }

  async findByEitherIdNameOrSlugOrFail(idNameOrSlug: string): Promise<School> {
    const $or: any = [{ name: idNameOrSlug }, { slug: idNameOrSlug }];
    if (isValidObjectId(idNameOrSlug)) {
      $or.push({ _id: idNameOrSlug });
    }

    const school = await this.schoolModel.findOne({ $or, isDeleted: false });
    if (!school) {
      throw new NotFoundException('school not found');
    }

    return school;
  }
}
