import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task } from 'src/task/entities/task.entity';
import { User } from 'src/task/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule} from '@nestjs/config';

@Module({
  imports: [
    ConfigModule, 
    TypeOrmModule.forFeature([Task]),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
