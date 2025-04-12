import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MailerModule } from '../mailer/mailer.module'; 

@Module({
  imports: [
    PassportModule,
    MailerModule,
    JwtModule.register({
      secret: 'secretKey', 
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([User]), 
  ],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
