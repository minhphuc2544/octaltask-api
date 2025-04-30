import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from 'src/dto/create-task.dto';
import { UpdateTaskDto } from 'src/dto/update-task.dto';
import { Task } from 'src/entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'



@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>
  ) {}

  async create(dto: CreateTaskDto, user: { userId: number }): Promise<Task> {
    const task = this.taskRepo.create({
      ...dto,
      user: { id: user.userId },
    });
    return await this.taskRepo.save(task);
  }

  async findAll(user: { userId: number }): Promise<Task[]> {
    return await this.taskRepo.find({
      where: {
        user: { id: user.userId },
      },
      relations: ['user'],
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        dueDate: true,
        user: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      }
    });
  }

  async findOne(id: number, user: { userId: number }): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: {
        id,
        user: { id: user.userId },
      },
      relations: ['user'],
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        dueDate: true,
        user: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      }
    });
    
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, user: { userId: number }): Promise<Task> {
    const task = await this.findOne(id, user);
    
    // Update the task with new values
    Object.assign(task, updateTaskDto);
    
    return await this.taskRepo.save(task);
  }

  async remove(id: number, user: { userId: number }): Promise<void> {
    const task = await this.findOne(id, user);
    await this.taskRepo.remove(task);
  }

  async getAllTasksForAdmin(): Promise<Task[]> {
    return await this.taskRepo.find();
  }
  
  async adminDeleteTask(id: number): Promise<void> {
    const task = await this.taskRepo.findOneBy({ id });
    if (!task) throw new NotFoundException('Task not found');
    await this.taskRepo.remove(task);
  }
  
}