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
import { ResetPasswordDto } from './dto/reset-password.dto'
import { ConfigModule, ConfigService } from '@nestjs/config';



@Module({
  imports: [
    ConfigModule.forRoot({
          isGlobal: true, 
        }),
    PassportModule,
    MailerModule,
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),

    TypeOrmModule.forFeature([User]), 
  ],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
