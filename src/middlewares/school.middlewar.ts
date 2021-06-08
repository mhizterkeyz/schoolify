import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { SchoolService } from '@src/school/school.service';

@Injectable()
export class SchoolMiddleware implements NestMiddleware {
  constructor(private readonly schoolService: SchoolService) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const { school: schoolId } = req.params;
    if (schoolId) {
      req.school = await this.schoolService.findByEitherIdNameOrSlugOrFail(
        schoolId,
      );
    }

    next();
  }
}
