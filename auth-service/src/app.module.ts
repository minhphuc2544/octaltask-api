import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/entities/user.entity';
import { MailerService } from './mailer/mailer.service';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '192.168.130.129',
      port: 3306,
      username: 'octaltask',
      password: 'octaltask',
      database: 'octaltask',
      entities: [User],
      synchronize: true, 
    }),
    AuthModule,
    MailerModule],
  controllers: [AppController, AuthController],
  providers: [AppService, MailerService],
  
})
export class AppModule {}
