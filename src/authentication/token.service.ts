import { BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment';

import { TOKEN } from '@src/constants';
import { WriteSession } from '@src/database';
import { ModelMethods, UtilService } from '@src/util';
import { Token } from './schema/authentication.schema';

class TokenModelMethods extends ModelMethods<Token> {
  constructor(tokenModel: Model<Token>) {
    super(tokenModel);
  }

  async getTokenByCode(code: string): Promise<Token | null> {
    return this.model.findOne({ code, isDeleted: false });
  }
}

export class TokenService extends TokenModelMethods {
  constructor(
    @InjectModel(TOKEN) tokenModel: Model<Token>,
    private readonly utilService: UtilService,
  ) {
    super(tokenModel);
  }

  async createEmailVerificationToken(
    userId: string,
    writeSession?: WriteSession,
  ): Promise<Token> {
    const code = this.utilService
      .generateRandomString(10, this.utilService.alphabetFactory)
      .toUpperCase();

    return this.create({ code, meta: userId } as Token, writeSession);
  }

  async createPasswordRecoveryToken(
    userId: string,
    writeSession?: WriteSession,
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
      writeSession,
    );
  }

  async getUserIDByPasswordRecoveryCode(code: string): Promise<string> {
    const token = await this.getTokenByCode(code);
    if (!token) {
      throw new BadRequestException('Invalid password recovery code');
    }

    const tokenExpired = moment(token.expires).isBefore(moment());
    if (tokenExpired) {
      throw new BadRequestException('Recovery token expired');
    }

    await this.updateOne(token, {
      expires: moment(token.expires)
        .subtract(1, 'hour')
        .toDate(),
    });

    return token.meta as string;
  }
}
