import { InjectModel } from '@nestjs/mongoose';
import { TOKEN } from '@src/constants';
import { WriteSession } from '@src/database';
import { UtilService } from '@src/util';
import { Model } from 'mongoose';

import { Token } from './schema/authentication.schema';

class TokenModelMethods {
  constructor(private readonly tokenModel: Model<Token>) {}

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
    writeSession: WriteSession,
  ): Promise<Token> {
    const code = this.utilService.generateRandomString(
      10,
      this.utilService.alphabetFactory,
    );

    const token = await this.createSingleToken(
      { code, meta: userId } as Token,
      writeSession,
    );

    return token;
  }
}