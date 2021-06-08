import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Connection, FilterQuery, isValidObjectId, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';

import {
  CommonServiceMethods,
  MongoosePaginationService,
  PaginationFilter,
  PaginationResult,
  UtilService,
} from '@src/util';
import { SCHOOL } from '@src/constants';
import { User } from '@src/user';
import {
  SchoolAdministrator,
  SchoolAdministratorService,
} from '@src/schooladministrator';
import { School } from './schema/school.schema';
import { CreateSchoolDTO } from './dto';
import { UpdateSchoolDTO } from './dto/update.dto';

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
      const schoolNameExists = await this.schoolModel.exists({
        name,
        isDeleted: false,
      });
      if (schoolNameExists) {
        throw new ConflictException('school name already taken');
      }

      const schoolSlugExists = await this.schoolModel.exists({
        slug,
        isDeleted: false,
      });
      if (schoolSlugExists) {
        throw new ConflictException('school slug already taken');
      }

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

  updateSchool(
    school: School,
    updateSchoolDTO: UpdateSchoolDTO,
  ): Promise<School> {
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
