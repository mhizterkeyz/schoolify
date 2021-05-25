import { InjectModel } from '@nestjs/mongoose';
import { TOKEN } from '@src/constants';
import { Model } from 'mongoose';

import { Token } from './schema/authentication.schema';

class TokenModelMethods {
  constructor(private readonly tokenModel: Model<Token>) {}
}

export class TokenService extends TokenModelMethods {
  constructor(@InjectModel(TOKEN) tokenModel: Model<Token>) {
    super(tokenModel);
  }
}
