import { merge } from 'lodash';
import { ClientSession, Document, FilterQuery, Model } from 'mongoose';

export class CommonServiceMethods<T extends Document> {
  constructor(private readonly model: Model<T>) {}

  async onModuleInit(): Promise<void> {
    await this.model.createCollection();
  }

  async create(payload: T, session?: ClientSession): Promise<T> {
    if (session) {
      const [document] = await this.model.create([payload], { session });
      return document;
    }

    return this.model.create(payload);
  }

  async updateDocument(
    document: T,
    update: Partial<T>,
    session: ClientSession = null,
  ): Promise<T> {
    merge(document, update);
    return document.save({ session });
  }

  async findById(_id: string): Promise<T> {
    return this.model.findOne(({
      _id,
      isDeleted: false,
    } as unknown) as FilterQuery<T>);
  }
}
