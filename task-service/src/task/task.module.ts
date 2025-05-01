import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task } from 'src/entities/task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule, 
    TypeOrmModule.forFeature([Task])
  ],
  controllers: [TaskController],
  providers: [TaskService, JwtStrategy],
})
export class TaskModule {}
