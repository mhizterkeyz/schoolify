import { Mail } from './email.schma';

export class EmailService {
  async send(_mail: Mail): Promise<void> {
    // send mail logic
  }
}
