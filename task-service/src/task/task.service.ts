import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from 'src/dto/create-task.dto';
import { UpdateTaskDto } from 'src/dto/update-task.dto';
import { Task } from 'src/entities/task.entity';
import { User } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'



@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>
  ) { }

  async create(dto: CreateTaskDto, user: { userId: number }): Promise<Task> {
    const task = this.taskRepo.create({
      ...dto,
      user: { id: user.userId },
    });
    return await this.taskRepo.save(task);
  }
}