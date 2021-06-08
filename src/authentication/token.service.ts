import { BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import * as moment from 'moment';

import { TOKEN } from '@src/constants';
import { CommonServiceMethods } from '@src/util/common/common.service.methods';
import { UtilService } from '@src/util/util.service';
import { Token } from './schema/authentication.schema';

export class TokenService extends CommonServiceMethods<Token> {
  constructor(
    @InjectModel(TOKEN) private readonly tokenModel: Model<Token>,
    private readonly utilService: UtilService,
  ) {
    super(tokenModel);
  }

  async createEmailVerificationToken(
    userId: string,
    session?: ClientSession,
  ): Promise<Token> {
    const code = this.utilService
      .generateRandomString(10, this.utilService.alphabetFactory)
      .toUpperCase();

    return this.create({ code, meta: userId } as Token, session);
  }

  async createPasswordRecoveryToken(
    userId: string,
    session?: ClientSession,
  ): Promise<Token> {
    const code = this.utilService.generateRandomString(10).toUpperCase();

    return this.create(
      {
        code,
        meta: userId,
        expires: moment() // Next hour
          .add(1, 'hour')
          .toDate(),
      } as Token,
      session,
    );
  }

  async getUserIDByPasswordRecoveryCode(code: string): Promise<string> {
    const token = await this.tokenModel.findOne({
      code,
      isUsed: false,
      expires: { $gt: moment().toDate() },
      isDeleted: false,
    });
    if (!token) {
      throw new BadRequestException('Invalid password recovery code');
    }

    await this.updateDocument(token, {
      isUsed: true,
      expires: moment()
        .subtract(1, 'hour')
        .toDate(),
    });

    return token.meta as string;
  }

  async getUnusedTokenByCode(code: string): Promise<Token> {
    return this.tokenModel.findOne({ code, isDeleted: false, isUsed: false });
  }
}
