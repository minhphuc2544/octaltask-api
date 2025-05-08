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
  async createTask(data: CreateTaskDto): Promise<Task> {
    console.log('Raw data:', data);                // 👈 In toàn bộ payload
    try {
      this.logger.debug(`Creating task: ${JSON.stringify(data)}`);
      
      console.log('Raw data:', data);                // 👈 In toàn bộ payload
      console.log('User from data:', data.user); 
         
      if (!data.user || !data.user.userId) {
        throw new InvalidTaskDataException({ message: 'User information missing from request' });
      }
      
      const user = data.user as { userId: number, email: string, role: string };
      return await this.taskService.create(data, { userId: user.userId });
    } catch (error) {
      console.log('Raw data:', error);  
      this.handleError('CreateTask', error);
      throw error;
    }
  }

  @GrpcMethod('TaskService', 'GetAllTasks')
  async GetAllTasks(data: { user: any }, metadata: any): Promise<{ tasks: Task[] }> {
    try {
      if (!data.user || !data.user.userId) {
        throw new InvalidTaskDataException({ message: 'User information missing from request' });
      }
      
      const user = data.user as { userId: number, email: string, role: string };
      const tasks = await this.taskService.findAll({ userId: user.userId });
      return { tasks };
    } catch (error) {
      this.handleError('GetAllTasks', error);
      throw error;
    }
  }
  
  @GrpcMethod('TaskService', 'GetTaskById')
  async GetTaskById(data: { id: number, user: any }, metadata: any): Promise<Task> {
    try {
      if (!data || typeof data.id !== 'number') {
        throw new InvalidTaskDataException({ reason: 'Invalid task ID format' });
      }
      
      if (!data.user || !data.user.userId) {
        throw new InvalidTaskDataException({ message: 'User information missing from request' });
      }
      
      const user = data.user as { userId: number, email: string, role: string };
      return await this.taskService.findOne(data.id, { userId: user.userId });
    } catch (error) {
      this.handleError('GetTaskById', error);
      throw error;
    }
  }

  @GrpcMethod('TaskService', 'UpdateTask')
  async UpdateTask(data: { id: number, title?: string, description?: string, isCompleted?: boolean, dueDate?: string, user: any }, metadata: any): Promise<Task> {
    try {
      if (!data || typeof data.id !== 'number') {
        throw new InvalidTaskDataException({ reason: 'Invalid task data format' });
      }
      
      if (!data.user || !data.user.userId) {
        throw new InvalidTaskDataException({ message: 'User information missing from request' });
      }
      
      const { id, user, ...updateTaskDto } = data;
      return await this.taskService.update(id, updateTaskDto, { userId: user.userId });
    } catch (error) {
      this.handleError('UpdateTask', error);
      throw error;
    }
  }

  @GrpcMethod('TaskService', 'DeleteTask')
  async DeleteTask(data: { id: number, user: any }, metadata: any): Promise<{ success: boolean, message: string }> {
    try {
      if (!data || typeof data.id !== 'number') {
        throw new InvalidTaskDataException({ reason: 'Invalid task ID format' });
      }
      
      if (!data.user || !data.user.userId) {
        throw new InvalidTaskDataException({ message: 'User information missing from request' });
      }
      
      const user = data.user as { userId: number, email: string, role: string };
      await this.taskService.remove(data.id, { userId: user.userId });
      return { success: true, message: 'Task deleted successfully' };
    } catch (error) {
      this.handleError('DeleteTask', error);
      throw error;
    }
  }

  // Admin methods with role verification
  @GrpcMethod('TaskService', 'GetAllTasksForAdmin')
  async GetAllTasksForAdmin(_, metadata: any): Promise<{ tasks: Task[] }> {
    try {
      const tasks = await this.taskService.getAllTasksForAdmin();
      return { tasks };
    } catch (error) {
      this.handleError('GetAllTasksForAdmin', error);
      throw error;
    }
  }

  @GrpcMethod('TaskService', 'AdminDeleteTask')
  async AdminDeleteTask(data: { id: number }, metadata: any): Promise<{ success: boolean, message: string }> {
    try {
      if (!data || typeof data.id !== 'number') {
        throw new InvalidTaskDataException({ reason: 'Invalid task ID format' });
      }
      
      await this.taskService.adminDeleteTask(data.id);
      return { success: true, message: 'Task deleted successfully' };
    } catch (error) {
      this.handleError('AdminDeleteTask', error);
      throw error;
    }
  }
  
  @GrpcMethod('TaskService', 'AdminUpdateTask')
  async AdminUpdateTask(data: { id: number, title?: string, description?: string, isCompleted?: boolean, dueDate?: string }, metadata: any): Promise<Task> {
    try {
      
      if (!data || typeof data.id !== 'number') {
        throw new InvalidTaskDataException({ reason: 'Invalid task data format' });
      }
      
      const { id, ...updateTaskDto } = data;
      return await this.taskService.adminUpdateTask(id, updateTaskDto);
    } catch (error) {
      this.handleError('AdminUpdateTask', error);
      throw error;
    }
  }
  
  @GrpcMethod('TaskService', 'GetTaskByIdForAdmin')
  async GetTaskByIdForAdmin(data: { id: number }, metadata: any): Promise<Task> {
    try {
      
      if (!data || typeof data.id !== 'number') {
        throw new InvalidTaskDataException({ reason: 'Invalid task ID format' });
      }
      
      return await this.taskService.getTaskByIdForAdmin(data.id);
    } catch (error) {
      this.handleError('GetTaskByIdForAdmin', error);
      throw error;
    }
  }

  @GrpcMethod('TaskService', 'GetAllTasksByUserId')
  async GetAllTasksByUserId(data: { userId: number }, metadata: any): Promise<{ tasks: Task[] }> {
    try {
      if (!data || typeof data.userId !== 'number') {
        throw new InvalidTaskDataException({ reason: 'Invalid user ID format' });
      }
      
      const tasks = await this.taskService.getAllTasksByUserId(data.userId);
      return { tasks };
    } catch (error) {
      this.handleError('GetAllTasksByUserId', error);
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