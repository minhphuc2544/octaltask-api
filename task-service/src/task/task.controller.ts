import { Controller } from '@nestjs/common';
import { TaskService } from './task.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @GrpcMethod('TaskService', 'CreateTask')
  async createTask(data: { 
    title: string; 
    description: string; 
    isCompleted?: boolean; 
    dueDate?: string;
    user: { userId: number; email: string; role: string } 
  }) {
    try {
      if (!data.title) {
        throw new RpcException('Title is required');
      }
      const something = await this.taskService.create(data, data.user);
      return something;
    } catch (error) {
      throw new RpcException(error.message || 'Failed to create task');
    }
  }

  @GrpcMethod('TaskService', 'GetAllTasks')
  async getAllTasks(data: { user: { userId: number; email: string; role: string } }) {
    try {
      if (!data.user || !data.user.userId) {
        throw new RpcException('User information missing from request');
      }
      
      const tasks = await this.taskService.findAll(data.user);
      return { tasks };
    } catch (error) {
      throw new RpcException(error.message || 'Failed to retrieve tasks');
    }
  }

  @GrpcMethod('TaskService', 'GetTaskById')
  async getTaskById(data: { 
    id: number; 
    user: { userId: number; email: string; role: string } 
  }) {
    try {
      if (!data || typeof data.id !== 'number') {
        throw new RpcException('Invalid task ID format');
      }
      
      if (!data.user || !data.user.userId) {
        throw new RpcException('User information missing from request');
      }
      
      return await this.taskService.findOne(data.id, data.user);
    } catch (error) {
      throw new RpcException(error.message || 'Failed to retrieve task');
    }
  }

  @GrpcMethod('TaskService', 'UpdateTask')
  async updateTask(data: { 
    id: number; 
    title?: string; 
    description?: string; 
    isCompleted?: boolean; 
    dueDate?: string;
    user: { userId: number; email: string; role: string } 
  }) {
    try {
      if (!data || typeof data.id !== 'number') {
        throw new RpcException('Invalid task data format');
      }
      
      if (!data.user || !data.user.userId) {
        throw new RpcException('User information missing from request');
      }
      
      const { id, user, ...updateTaskDto } = data;
      return await this.taskService.update(id, updateTaskDto, user);
    } catch (error) {
      throw new RpcException(error.message || 'Failed to update task');
    }
  }

  @GrpcMethod('TaskService', 'DeleteTask')
  async deleteTask(data: { 
    id: number; 
    user: { userId: number; email: string; role: string } 
  }) {
    try {
      if (!data || typeof data.id !== 'number') {
        throw new RpcException('Invalid task ID format');
      }
      
      if (!data.user || !data.user.userId) {
        throw new RpcException('User information missing from request');
      }
      
      await this.taskService.remove(data.id, data.user);
      return { message: 'Task deleted successfully' };
    } catch (error) {
      throw new RpcException(error.message || 'Failed to delete task');
    }
  }

  @GrpcMethod('TaskService', 'GetAllTasksForAdmin')
  async getAllTasksForAdmin() {
    try {
      const tasks = await this.taskService.getAllTasksForAdmin();
      return { tasks };
    } catch (error) {
      throw new RpcException(error.message || 'Failed to retrieve tasks');
    }
  }

  @GrpcMethod('TaskService', 'GetTaskByIdForAdmin')
  async getTaskByIdForAdmin(data: { id: number }) {
    try {
      if (!data || typeof data.id !== 'number') {
        throw new RpcException('Invalid task ID format');
      }
      
      return await this.taskService.getTaskByIdForAdmin(data.id);
    } catch (error) {
      throw new RpcException(error.message || 'Failed to retrieve task');
    }
  }

  @GrpcMethod('TaskService', 'AdminUpdateTask')
  async adminUpdateTask(data: { 
    id: number; 
    title?: string; 
    description?: string; 
    isCompleted?: boolean; 
    dueDate?: string 
  }) {
    try {
      if (!data || typeof data.id !== 'number') {
        throw new RpcException('Invalid task data format');
      }
      
      const { id, ...updateTaskDto } = data;
      return await this.taskService.adminUpdateTask(id, updateTaskDto);
    } catch (error) {
      throw new RpcException(error.message || 'Failed to update task');
    }
  }

  @GrpcMethod('TaskService', 'AdminDeleteTask')
  async adminDeleteTask(data: { id: number }) {
    try {
      if (!data || typeof data.id !== 'number') {
        throw new RpcException('Invalid task ID format');
      }
      
      await this.taskService.adminDeleteTask(data.id);
      return { message: 'Task deleted successfully' };
    } catch (error) {
      throw new RpcException(error.message || 'Failed to delete task');
    }
  }

  @GrpcMethod('TaskService', 'GetAllTasksByUserId')
  async getAllTasksByUserId(data: { userId: number }) {
    try {
      if (!data || typeof data.userId !== 'number') {
        throw new RpcException('Invalid user ID format');
      }
      
      const tasks = await this.taskService.getAllTasksByUserId(data.userId);
      return { tasks };
    } catch (error) {
      throw new RpcException(error.message || 'Failed to retrieve tasks');
    }
  }
}