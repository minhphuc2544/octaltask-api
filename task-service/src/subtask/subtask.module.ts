import { Module } from '@nestjs/common';
import { SubtaskService } from './subtask.service';
import { SubtaskController } from './subtask.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/task/entities/task.entity';
import { User } from 'src/task/entities/user.entity';
import { Subtask } from 'src/task/entities/subtask.entity';
import { Comment } from 'src/task/entities/comment.entity';

@Module({
  imports: [
    ConfigModule, 
    TypeOrmModule.forFeature([Task]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Comment]),
    TypeOrmModule.forFeature([Subtask]),
  ],
  controllers: [SubtaskController],
  providers: [SubtaskService],
})
export class SubtaskModule {}
