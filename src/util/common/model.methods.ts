import { Model, Document, LeanDocument } from 'mongoose';
import { merge } from 'lodash';

import { WriteSession } from '@src/database';

export class ModelMethods<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async onModuleInit(): Promise<void> {
    // Init collections
    await this.model.createCollection();
  }

  async create(payload: T, writeSession?: WriteSession): Promise<T> {
    if (writeSession) {
      const session = writeSession.getSession();
      const [token] = await this.model.create([payload], { session });

      return token;
    }

    return this.model.create(payload);
  }

  async updateOne(doc: T, update: Partial<T>): Promise<T> {
    merge(doc, update);

    return doc.save();
  }

  async findById(_id: string): Promise<T | null> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.model.findOne({ _id, isDeleted: false });
  }

  json(doc: T): LeanDocument<T> {
    return doc.toJSON();
  }
}
