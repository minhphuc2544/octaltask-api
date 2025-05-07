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
  ) {}

  async create(dto: CreateTaskDto, user: { userId: number }): Promise<Task> {
    try {
      if (!dto.title) {
        throw new InvalidTaskDataException({ field: 'title', message: 'Title is required' });
      }

      this.logger.debug(`Creating task for user: ${user.userId}`);
      
      const task = this.taskRepo.create({
        ...dto,
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
          user: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      });
    } catch (error) {
      this.logger.error(`Error finding tasks for user ${user.userId}:`, error);
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
        // Check if task exists but belongs to another user
        const taskExists = await this.taskRepo.findOne({
          where: { id },
          select: { id: true }
        });
        
        if (taskExists) {
          this.logger.warn(`User ${user.userId} attempted to access task ${id} belonging to another user`);
          throw new TaskAccessDeniedException(id, user.userId);
        }
        
        throw new TaskNotFoundException(id);
      }
      
      return task;
    } catch (error) {
      // Re-throw our custom exceptions
      if (error instanceof TaskNotFoundException || 
          error instanceof TaskAccessDeniedException) {
        throw error;
      }
      
      this.logger.error(`Error finding task ${id} for user ${user.userId}:`, error);
      throw new InvalidTaskDataException({ 
        operation: 'findOne',
        taskId: id,
        message: 'Failed to retrieve task due to a database error' 
      });
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, user: { userId: number }): Promise<Task> {
    try {
      // First make sure the task exists and belongs to the user
      const task = await this.findOne(id, user);
      
      this.logger.debug(`Updating task ${id} for user: ${user.userId}`);
      
      // Update the task with new values
      Object.assign(task, updateTaskDto);
      
      return await this.taskRepo.save(task);
    } catch (error) {
      // Re-throw our custom exceptions
      if (error instanceof TaskNotFoundException || 
          error instanceof TaskAccessDeniedException ||
          error instanceof InvalidTaskDataException) {
        throw error;
      }
      
      this.logger.error(`Error updating task ${id} for user ${user.userId}:`, error);
      throw new InvalidTaskDataException({ 
        operation: 'update',
        taskId: id,
        message: 'Failed to update task due to a database error' 
      });
    }
  }

  async remove(id: number, user: { userId: number }): Promise<void> {
    try {
      // First make sure the task exists and belongs to the user
      const task = await this.findOne(id, user);
      
      this.logger.debug(`Deleting task ${id} for user: ${user.userId}`);
      
      await this.taskRepo.remove(task);
    } catch (error) {
      // Re-throw our custom exceptions
      if (error instanceof TaskNotFoundException || 
          error instanceof TaskAccessDeniedException ||
          error instanceof InvalidTaskDataException) {
        throw error;
      }
      
      this.logger.error(`Error removing task ${id} for user ${user.userId}:`, error);
      throw new InvalidTaskDataException({ 
        operation: 'remove',
        taskId: id,
        message: 'Failed to delete task due to a database error' 
      });
    }
  }

  async getAllTasksForAdmin(): Promise<Task[]> {
    try {
      this.logger.debug('Admin retrieving all tasks');
      
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
    } catch (error) {
      this.logger.error('Error retrieving all tasks for admin:', error);
      throw new InvalidTaskDataException({ 
        operation: 'getAllTasksForAdmin',
        message: 'Failed to retrieve tasks due to a database error' 
      });
    }
  }
  
  async adminDeleteTask(id: number): Promise<void> {
    try {
      const task = await this.taskRepo.findOneBy({ id });
      
      if (!task) {
        throw new TaskNotFoundException(id);
      }
      
      this.logger.debug(`Admin deleting task ${id}`);
      
      await this.taskRepo.remove(task);
    } catch (error) {
      // Re-throw our custom exceptions
      if (error instanceof TaskNotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error in admin deletion of task ${id}:`, error);
      throw new InvalidTaskDataException({ 
        operation: 'adminDeleteTask',
        taskId: id,
        message: 'Failed to delete task due to a database error' 
      });
    }
  }
  
  async adminUpdateTask(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    try {
      const task = await this.taskRepo.findOne({
        where: { id },
        relations: ['user']
      });
      
      if (!task) {
        throw new TaskNotFoundException(id);
      }
      
      this.logger.debug(`Admin updating task ${id}`);
      
      // Update the task with new values
      Object.assign(task, updateTaskDto);
      
      return await this.taskRepo.save(task);
    } catch (error) {
      // Re-throw our custom exceptions
      if (error instanceof TaskNotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error in admin update of task ${id}:`, error);
      throw new InvalidTaskDataException({ 
        operation: 'adminUpdateTask',
        taskId: id,
        message: 'Failed to update task due to a database error' 
      });
    }
  }

  async getTaskByIdForAdmin(id: number): Promise<Task> {
    try {
      this.logger.debug(`Admin retrieving task ${id}`);
      
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
        throw new TaskNotFoundException(id);
      }
      
      return task;
    } catch (error) {
      // Re-throw our custom exceptions
      if (error instanceof TaskNotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error in admin retrieval of task ${id}:`, error);
      throw new InvalidTaskDataException({ 
        operation: 'getTaskByIdForAdmin',
        taskId: id,
        message: 'Failed to retrieve task due to a database error' 
      });
    }
  }

  async getAllTasksByUserId(userId: number): Promise<Task[]> {
    try {
      this.logger.debug(`Admin retrieving all tasks for user ${userId}`);
      
      return await this.taskRepo.find({
        where: { user: { id: userId } },
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
    } catch (error) {
      this.logger.error(`Error retrieving tasks for user ${userId} by admin:`, error);
      throw new InvalidTaskDataException({ 
        operation: 'getAllTasksByUserId',
        userId,
        message: 'Failed to retrieve tasks due to a database error' 
      });
    }
  }
}