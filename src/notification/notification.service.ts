import { Injectable } from '@nestjs/common';
import { configure, Environment } from 'nunjucks';
import { join } from 'path';

import { Address, Mail } from './email/email.schma';
import { EmailService } from './email/email.service';
import { VerifyEmailPayload } from './schema/notification.schema';

@Injectable()
export class NotificationService {
  private readonly emailService = new EmailService();

  private readonly templateEngine: Environment = configure(
    join(__dirname, '../../../', 'templates'),
    { autoescape: true },
  );

  private readonly defaultFromAddress = new Address(
    'info@schoolify.app',
    'Schoolify',
  );

  async sendEmailVerificationMessage(
    reciepient: Address,
    verifyEmailPayload: VerifyEmailPayload,
  ): Promise<void> {
    const body = this.templateEngine.render(
      'email-verification.njk',
      verifyEmailPayload,
    );

    const mail = new Mail(
      this.defaultFromAddress,
      [reciepient],
      'Schoolify: Verify email',
      body,
    );

    await this.emailService.send(mail);
  }
}
