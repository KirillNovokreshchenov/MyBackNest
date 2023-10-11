import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailAdapter {
  // constructor(private mailerService: MailerService) {}
  async sendEmail(emailUser: string, subject: string, htmlMessages: string) {
    // const mailOptions = {
    //   from: 'Kirill <kirochkaqwerty123@gmail.com>',
    //   to: emailUser,
    //   subject: subject,
    //   html: htmlMessages,
    // };
    // await this.mailerService.sendMail(mailOptions);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'kirochkaqwerty123@gmail.com',
        pass: 'otzaxohazcnetzvc',
      },
    });

    const mailOptions = {
      from: 'Kirill <kirochkaqwerty123@gmail.com>',
      to: emailUser,
      subject: subject,
      html: htmlMessages,
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      }
    });
  }
}
