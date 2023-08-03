import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailAdapter {
  constructor(private mailerService: MailerService) {}
  async sendEmail(emailUser: string, subject: string, htmlMessages: string) {
    const mailOptions = {
      from: 'Kirill <kirochkaqwerty123@gmail.com>',
      to: emailUser,
      subject: subject,
      html: htmlMessages,
    };
    await this.mailerService.sendMail(mailOptions);
  }
}
