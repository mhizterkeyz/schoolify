import { InjectModel } from '@nestjs/mongoose';
import { TOKEN } from '@src/constants';
import { WriteSession } from '@src/database';
import { UtilService } from '@src/util';
import { Model } from 'mongoose';
import { merge } from 'lodash';
import * as moment from 'moment';

import { Token } from './schema/authentication.schema';

class TokenModelMethods {
  constructor(private readonly tokenModel: Model<Token>) {}

  async onModuleInit(): Promise<void> {
    // Init collections
    await this.tokenModel.createCollection();
  }

  async createSingleToken(
    payload: Token,
    writeSession?: WriteSession,
  ): Promise<Token> {
    if (writeSession) {
      const session = writeSession.getSession();
      const [token] = await this.tokenModel.create([payload], { session });

      return token;
    }

    return this.tokenModel.create(payload);
  }

  async getTokenByCode(code: string): Promise<Token | null> {
    return this.tokenModel.findOne({ code, isDeleted: false });
  }

  async updateToken(token: Token, update: Partial<Token>): Promise<Token> {
    merge(token, update);

    return token.save();
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

    return this.createSingleToken(
      { code, meta: userId } as Token,
      writeSession,
    );
  }

  async createPasswordRecoveryToken(
    userId: string,
    writeSession?: WriteSession,
  ): Promise<Token> {
    const code = this.utilService.generateRandomString(10).toUpperCase();

    return this.createSingleToken(
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
}
