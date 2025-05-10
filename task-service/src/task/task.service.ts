import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { console } from 'inspector';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>
  ) {}

  async create(dto: any, user: { userId: number; email?: string; role?: string }) {
    
    const task = this.taskRepo.create({
      title: dto.title,
      description: dto.description,
      isCompleted: dto.isCompleted || false,
      dueDate: dto.dueDate,
       user: { id: user.userId },
    });
    
  console.log('\n\n\n\nTask created:', user.userId);
    return await this.taskRepo.save(task);
  }
           

  async findAll(user: { userId: number; email?: string; role?: string }) {
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

  async findOne(id: number, user: { userId: number; email?: string; role?: string }) {
    const task = await this.taskRepo.findOne({
      where: {
        id,
        user: { id: user.userId }
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
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: number, updateTaskDto: any, user: { userId: number; email?: string; role?: string }) {
    // First, find the task to ensure it exists and belongs to the user
    const task = await this.taskRepo.findOne({
      where: {
        id,
        user: { id: user.userId }
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Update the task
    Object.assign(task, updateTaskDto);

    return await this.taskRepo.save(task);
  }

  async remove(id: number, user: { userId: number; email?: string; role?: string }) {
    // First, find the task to ensure it exists and belongs to the user
    const task = await this.taskRepo.findOne({
      where: {
        id,
        user: { id: user.userId }
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Delete the task
    await this.taskRepo.remove(task);

    return { success: true };
  }

  async getAllTasksForAdmin() {
    return await this.taskRepo.find({
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

  async getTaskByIdForAdmin(id: number) {
    const task = await this.taskRepo.findOne({
      where: { id },
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
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async adminUpdateTask(id: number, updateTaskDto: any) {
    // First, find the task to ensure it exists
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['user']
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Update the task
    Object.assign(task, updateTaskDto);

    return await this.taskRepo.save(task);
  }

  async adminDeleteTask(id: number) {
    // First, find the task to ensure it exists
    const task = await this.taskRepo.findOne({
      where: { id }
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Delete the task
    await this.taskRepo.remove(task);

    return { success: true };
  }

  async getAllTasksByUserId(userId: number) {
    const tasks = await this.taskRepo.find({
      where: {
        user: { id: userId }
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

    return tasks;
  }
}