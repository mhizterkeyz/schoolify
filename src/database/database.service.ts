import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';

export class WriteSession {
  constructor(private readonly session: ClientSession) {}

  async save(): Promise<void> {
    await this.session.commitTransaction();
    this.session.endSession();
  }

  async abort(): Promise<void> {
    await this.session.abortTransaction();
    this.session.endSession();
  }

  getSession(): ClientSession {
    return this.session;
  }
}

@Injectable()
export class DatabaseService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async startWriteSession(): Promise<WriteSession> {
    const session = await this.connection.startSession();
    session.startTransaction();

    return new WriteSession(session);
  }
}
