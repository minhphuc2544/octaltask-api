import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/strategies/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'octaltask',
      password: 'octaltask',
      database: 'octaltask',
      entities: [User],
      synchronize: true, 
    }),
    AuthModule],
  controllers: [AppController, AuthController],
  providers: [AppService],
  
})
export class AppModule {}
