// src/mailer/mailer.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  async sendResetPasswordEmail(email: string, token) {
    const templatePath = path.join(__dirname, 'templates', 'reset-password.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf-8');

    // Thay thế biến động
    htmlContent = htmlContent
  .replace('{{ username }}', email)
  .replace('{{ resetLink }}', `http://localhost:3000/auth/reset-password?token=${token}`);


    await this.mailerService.sendMail({
      to: email,
      subject: '🔐 Your OctalTask Password Reset',
      html: htmlContent,
    });
  }
}
