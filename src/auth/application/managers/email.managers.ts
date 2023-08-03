import { EmailAdapter } from '../../infrastructure/adapters/email.adapter';
import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user.schema';

@Injectable()
export class EmailManagers {
  constructor(protected emailAdapter: EmailAdapter) {}
  async emailRegistration(user: User) {
    const emailUser = user.email;

    const subject = 'Complete registration';

    const htmlMessages = `<h1>Thank for your registration</h1>
       <p>To finish registration please follow the link below:
        <a href='https://somesite.com/confirm-email?code=${user.emailConfirmation.confirmationCode}'>complete registration</a>
       </p>`;

    await this.emailAdapter.sendEmail(emailUser, subject, htmlMessages);
  }
  async passwordRecovery(email, recoveryCode) {
    const emailUser = email;

    const subject = 'Password recovery';

    const htmlMessages = `<h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
      </p>`;

    await this.emailAdapter.sendEmail(emailUser, subject, htmlMessages);
  }
}
