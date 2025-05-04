// src/mailer/mailer.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) { }

  async sendResetPasswordEmail(email: string, token) {
    let resetLink = `http://localhost:5173/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Your OctalTask Password Reset',
      template: './reset-password',
      context: {
        email: email,
        resetLink: resetLink,
      },
    });
  }
}
