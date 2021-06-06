/* eslint-disable @typescript-eslint/ban-ts-comment */
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
    // @ts-ignore
    return this.model.findOne({ _id, isDeleted: false });
  }

  async deleteOne(doc: T): Promise<T> {
    //  @ts-ignore
    return this.updateOne(doc, { isDeleted: true });
  }

  json(doc: T): LeanDocument<T> {
    return doc.toJSON();
  }
}
