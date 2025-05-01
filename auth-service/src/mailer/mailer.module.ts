// mailer.module.ts
import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { MailerService } from './mailer.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    NestMailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true nếu dùng port 465
        auth: {
          user: 'octaltask.service@gmail.com',
          pass: 'svnm tpwh ttfw lfnh', // dùng App Password nếu dùng Gmail
        },
      },
      defaults: {
        from: '"OctalTask" <octaltask.service@gmail.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [],
  providers: [MailerService],
  exports: [MailerService], // 👈 export để chỗ khác dùng được
})
export class MailerModule {}
