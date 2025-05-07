import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task } from 'src/task/entities/task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule, 
    TypeOrmModule.forFeature([Task])
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
