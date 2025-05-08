import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import {
  TaskNotFoundException,
  TaskAccessDeniedException,
  InvalidTaskDataException
} from '../common/exceptions/task-exceptions';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>
  ) { }

  async create(dto: CreateTaskDto, user: { userId: number }): Promise<Task> {
    try {
      if (!dto.title) {
        throw new InvalidTaskDataException({ field: 'title', message: 'Title is required' });
      }

      this.logger.debug(`Creating task for user: ${user.userId}`);
      
      // Check if a task with the same title exists for this user
      const existingTask = await this.taskRepo.findOne({
        where: {
          title: dto.title,
          user: { id: user.userId }
        }
      });

      if (existingTask) {
        throw new InvalidTaskDataException({
          field: 'title',
          message: 'Task with this title already exists'
        });
      }

      const task = this.taskRepo.create({
        title: dto.title,
        description: dto.description,
        isCompleted: dto.isCompleted || false,
        dueDate: dto.dueDate,
        user: { id: user.userId },
      });

      return await this.taskRepo.save(task);
    } catch (error) {
      if (error instanceof InvalidTaskDataException) {
        throw error;
      }

      this.logger.error('Failed to create task:', error);
      throw new InvalidTaskDataException({
        operation: 'create',
        message: 'Failed to create task due to a database error'
      });
    }
  }

  async findAll(user: { userId: number }): Promise<Task[]> {
    try {
      this.logger.debug(`Finding all tasks for user: ${user.userId}`);

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
          //createdAt: true,
          //updatedAt: true,
          user: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      });
    } catch (error) {
      this.logger.error('Failed to fetch tasks:', error);
      throw new InvalidTaskDataException({
        operation: 'findAll',
        message: 'Failed to retrieve tasks due to a database error'
      });
    }
  }

  async findOne(id: number, user: { userId: number }): Promise<Task> {
    try {
      this.logger.debug(`Finding task ${id} for user: ${user.userId}`);

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
          //createdAt: true,
          //updatedAt: true,
          user: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      });

      if (!task) {
        throw new TaskNotFoundException(id);
      }

      return task;
    } catch (error) {
      if (error instanceof TaskNotFoundException) {
        throw error;
      }

      this.logger.error(`Failed to fetch task ${id}:`, error);
      throw new InvalidTaskDataException({
        operation: 'findOne',
        message: 'Failed to retrieve task due to a database error'
      });
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, user: { userId: number }): Promise<Task> {
    try {
      this.logger.debug(`Updating task ${id} for user: ${user.userId}`);

      // First, find the task to ensure it exists and belongs to the user
      const task = await this.taskRepo.findOne({
        where: {
          id,
          user: { id: user.userId }
        }
      });

      if (!task) {
        throw new TaskNotFoundException(id);
      }

      // Update the task
      Object.assign(task, updateTaskDto);

      return await this.taskRepo.save(task);
    } catch (error) {
      if (error instanceof TaskNotFoundException) {
        throw error;
      }

      this.logger.error(`Failed to update task ${id}:`, error);
      throw new InvalidTaskDataException({
        operation: 'update',
        message: 'Failed to update task due to a database error'
      });
    }
  }

  async remove(id: number, user: { userId: number }): Promise<void> {
    try {
      this.logger.debug(`Removing task ${id} for user: ${user.userId}`);

      // First, find the task to ensure it exists and belongs to the user
      const task = await this.taskRepo.findOne({
        where: {
          id,
          user: { id: user.userId }
        }
      });

      if (!task) {
        throw new TaskNotFoundException(id);
      }

      // Delete the task
      await this.taskRepo.remove(task);
    } catch (error) {
      if (error instanceof TaskNotFoundException) {
        throw error;
      }

      this.logger.error(`Failed to delete task ${id}:`, error);
      throw new InvalidTaskDataException({
        operation: 'delete',
        message: 'Failed to delete task due to a database error'
      });
    }
  }

  async getAllTasksForAdmin(): Promise<Task[]> {
    try {
      this.logger.debug('Admin fetching all tasks');

      return await this.taskRepo.find({
        relations: ['user'],
        select: {
          id: true,
          title: true,
          description: true,
          isCompleted: true,
          dueDate: true,
          //createdAt: true,
          //updatedAt: true,
          user: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      });
    } catch (error) {
      this.logger.error('Admin failed to fetch all tasks:', error);
      throw new InvalidTaskDataException({
        operation: 'getAllTasksForAdmin',
        message: 'Failed to retrieve tasks due to a database error'
      });
    }
  }

  async getTaskByIdForAdmin(id: number): Promise<Task> {
    try {
      this.logger.debug(`Admin fetching task ${id}`);

      const task = await this.taskRepo.findOne({
        where: { id },
        relations: ['user'],
        select: {
          id: true,
          title: true,
          description: true,
          isCompleted: true,
          dueDate: true,
          //createdAt: true,
          //updatedAt: true,
          user: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      });

      if (!task) {
        throw new TaskNotFoundException(id);
      }

      return task;
    } catch (error) {
      if (error instanceof TaskNotFoundException) {
        throw error;
      }

      this.logger.error(`Admin failed to fetch task ${id}:`, error);
      throw new InvalidTaskDataException({
        operation: 'getTaskByIdForAdmin',
        message: 'Failed to retrieve task due to a database error'
      });
    }
  }

  async adminUpdateTask(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    try {
      this.logger.debug(`Admin updating task ${id}`);

      // First, find the task to ensure it exists
      const task = await this.taskRepo.findOne({
        where: { id },
        relations: ['user']
      });

      if (!task) {
        throw new TaskNotFoundException(id);
      }

      // Update the task
      Object.assign(task, updateTaskDto);

      return await this.taskRepo.save(task);
    } catch (error) {
      if (error instanceof TaskNotFoundException) {
        throw error;
      }

      this.logger.error(`Admin failed to update task ${id}:`, error);
      throw new InvalidTaskDataException({
        operation: 'adminUpdateTask',
        message: 'Failed to update task due to a database error'
      });
    }
  }

  async adminDeleteTask(id: number): Promise<void> {
    try {
      this.logger.debug(`Admin deleting task ${id}`);

      // First, find the task to ensure it exists
      const task = await this.taskRepo.findOne({
        where: { id }
      });

      if (!task) {
        throw new TaskNotFoundException(id);
      }

      // Delete the task
      await this.taskRepo.remove(task);
    } catch (error) {
      if (error instanceof TaskNotFoundException) {
        throw error;
      }

      this.logger.error(`Admin failed to delete task ${id}:`, error);
      throw new InvalidTaskDataException({
        operation: 'adminDeleteTask',
        message: 'Failed to delete task due to a database error'
      });
    }
  }

  async getAllTasksByUserId(userId: number): Promise<Task[]> {
    try {
      this.logger.debug(`Admin fetching all tasks for user: ${userId}`);

      // Check if the user exists
      const tasksForUser = await this.taskRepo.find({
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
          //createdAt: true,
          //updatedAt: true,
          user: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      });

      // If no tasks found for the user, check if the user exists
      if (tasksForUser.length === 0) {
        // Here we would ideally check if the user exists in the database
        // For now, we'll just return an empty array since that's what the API Gateway expects
        return [];
      }

      return tasksForUser;
    } catch (error) {
      this.logger.error(`Admin failed to fetch tasks for user ${userId}:`, error);
      throw new InvalidTaskDataException({
        operation: 'getAllTasksByUserId',
        message: 'Failed to retrieve tasks due to a database error'
      });
    }
  }
}