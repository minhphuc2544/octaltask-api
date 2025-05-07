import { Controller, UseFilters, UseInterceptors, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './entities/task.entity';
import { GrpcExceptionFilter } from '../common/filters/grpc-exception.filter';
import { InvalidTaskDataException } from '../common/exceptions/task-exceptions';
import { GrpcUserInterceptor } from 'src/common/interceptor/grpc-user.interceptor';
import { ErrorLoggerInterceptor } from 'src/common/interceptor/error-logger.interceptor';

@Controller()
@UseFilters(GrpcExceptionFilter)
@UseInterceptors(GrpcUserInterceptor, ErrorLoggerInterceptor)
export class TaskController {
  private readonly logger = new Logger(TaskController.name);

  constructor(private readonly taskService: TaskService) {}

  @GrpcMethod('TaskService', 'CreateTask')
  async createTask(data: CreateTaskDto, metadata: any): Promise<Task> {
    try {
      this.logger.debug(`Creating task: ${JSON.stringify(data)}`);
      
      if (!metadata.user || !metadata.user.userId) {
        throw new InvalidTaskDataException({ message: 'User information missing from request' });
      }
      
      const user = metadata.user as { userId: number, email: string, role: string };
      return await this.taskService.create(data, user);
    } catch (error) {
      this.handleError('createTask', error);
      throw error;
    }
  }

  @GrpcMethod('TaskService', 'GetAllTasks')
  async getAllTasks(_, metadata: any): Promise<{ tasks: Task[] }> {
    try {
      if (!metadata.user || !metadata.user.userId) {
        throw new InvalidTaskDataException({ message: 'User information missing from request' });
      }
      
      const user = metadata.user as { userId: number, email: string, role: string };
      const tasks = await this.taskService.findAll(user);
      return { tasks };
    } catch (error) {
      this.handleError('getAllTasks', error);
      throw error;
    }
  }
  
  @GrpcMethod('TaskService', 'GetTaskById')
  async getTaskById(data: { id: number }, metadata: any): Promise<Task> {
    try {
      if (!data || typeof data.id !== 'number') {
        throw new InvalidTaskDataException({ reason: 'Invalid task ID format' });
      }
      
      if (!metadata.user || !metadata.user.userId) {
        throw new InvalidTaskDataException({ message: 'User information missing from request' });
      }
      
      const user = metadata.user as { userId: number, email: string, role: string };
      return await this.taskService.findOne(data.id, user);
    } catch (error) {
      this.handleError('getTaskById', error);
      throw error;
    }
  }

  @GrpcMethod('TaskService', 'UpdateTask')
  async updateTask(data: { id: number, title?: string, description?: string, isCompleted?: boolean, dueDate?: string }, metadata: any): Promise<Task> {
    try {
      if (!data || typeof data.id !== 'number') {
        throw new InvalidTaskDataException({ reason: 'Invalid task data format' });
      }
      
      if (!metadata.user || !metadata.user.userId) {
        throw new InvalidTaskDataException({ message: 'User information missing from request' });
      }
      
      const { id, ...updateTaskDto } = data;
      const user = metadata.user as { userId: number, email: string, role: string };
      return await this.taskService.update(id, updateTaskDto, user);
    } catch (error) {
      this.handleError('updateTask', error);
      throw error;
    }
  }

  @GrpcMethod('TaskService', 'DeleteTask')
  async deleteTask(data: { id: number }, metadata: any): Promise<void> {
    try {
      if (!data || typeof data.id !== 'number') {
        throw new InvalidTaskDataException({ reason: 'Invalid task ID format' });
      }
      
      if (!metadata.user || !metadata.user.userId) {
        throw new InvalidTaskDataException({ message: 'User information missing from request' });
      }
      
      const user = metadata.user as { userId: number, email: string, role: string };
      return await this.taskService.remove(data.id, user);
    } catch (error) {
      this.handleError('deleteTask', error);
      throw error;
    }
  }

  // Admin methods with role verification
  @GrpcMethod('TaskService', 'GetAllTasksForAdmin')
  async getAllTasksForAdmin(_, metadata: any): Promise<{ tasks: Task[] }> {
    try {
      if (!metadata.user || !metadata.user.userId || metadata.user.role !== 'admin') {
        throw new InvalidTaskDataException({ message: 'Admin privileges required' });
      }
      
      const tasks = await this.taskService.getAllTasksForAdmin();
      return { tasks };
    } catch (error) {
      this.handleError('getAllTasksForAdmin', error);
      throw error;
    }
  }

  @GrpcMethod('TaskService', 'AdminDeleteTask')
  async adminDeleteTask(data: { id: number }, metadata: any): Promise<void> {
    try {
      if (!metadata.user || !metadata.user.userId || metadata.user.role !== 'admin') {
        throw new InvalidTaskDataException({ message: 'Admin privileges required' });
      }
      
      if (!data || typeof data.id !== 'number') {
        throw new InvalidTaskDataException({ reason: 'Invalid task ID format' });
      }
      
      return await this.taskService.adminDeleteTask(data.id);
    } catch (error) {
      this.handleError('adminDeleteTask', error);
      throw error;
    }
  }
  
  @GrpcMethod('TaskService', 'AdminUpdateTask')
  async adminUpdateTask(data: { id: number, title?: string, description?: string, isCompleted?: boolean, dueDate?: string }, metadata: any): Promise<Task> {
    try {
      if (!metadata.user || !metadata.user.userId || metadata.user.role !== 'admin') {
        throw new InvalidTaskDataException({ message: 'Admin privileges required' });
      }
      
      if (!data || typeof data.id !== 'number') {
        throw new InvalidTaskDataException({ reason: 'Invalid task data format' });
      }
      
      const { id, ...updateTaskDto } = data;
      return await this.taskService.adminUpdateTask(id, updateTaskDto);
    } catch (error) {
      this.handleError('adminUpdateTask', error);
      throw error;
    }
  }
  
  @GrpcMethod('TaskService', 'GetTaskByIdForAdmin')
  async getTaskByIdForAdmin(data: { id: number }, metadata: any): Promise<Task> {
    try {
      if (!metadata.user || !metadata.user.userId || metadata.user.role !== 'admin') {
        throw new InvalidTaskDataException({ message: 'Admin privileges required' });
      }
      
      if (!data || typeof data.id !== 'number') {
        throw new InvalidTaskDataException({ reason: 'Invalid task ID format' });
      }
      
      return await this.taskService.getTaskByIdForAdmin(data.id);
    } catch (error) {
      this.handleError('getTaskByIdForAdmin', error);
      throw error;
    }
  }

  @GrpcMethod('TaskService', 'GetAllTasksByUserId')
  async getAllTasksByUserId(data: { userId: number }, metadata: any): Promise<{ tasks: Task[] }> {
    try {
      if (!metadata.user || !metadata.user.userId || metadata.user.role !== 'admin') {
        throw new InvalidTaskDataException({ message: 'Admin privileges required' });
      }
      
      if (!data || typeof data.userId !== 'number') {
        throw new InvalidTaskDataException({ reason: 'Invalid user ID format' });
      }
      
      const tasks = await this.taskService.getAllTasksByUserId(data.userId);
      return { tasks };
    } catch (error) {
      this.handleError('getAllTasksByUserId', error);
      throw error;
    }
  }

  // Helper method for consistent error handling
  private handleError(method: string, error: any): void {
    if (error.code && error.message) {
      // This is already a properly formatted RPC exception
      this.logger.warn(`${method} error: ${error.message}`);
    } else {
      this.logger.error(`Unhandled exception in ${method}:`, error);
    }
  }
}