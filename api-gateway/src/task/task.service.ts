import { Injectable, OnModuleInit, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

interface TaskGrpcService {
  CreateTask(data: any): any;
  GetAllTasks(data: any): any;
  GetTaskById(data: any): any;
  UpdateTask(data: any): any;
  DeleteTask(data: any): any;
  GetAllTasksForAdmin(data: any): any;
  AdminDeleteTask(data: any): any;
  AdminUpdateTask(data: any): any;
  GetTaskByIdForAdmin(data: any): any;
  GetAllTasksByUserId(data: any): any;
}

@Injectable()
export class TaskService implements OnModuleInit {
  private taskGrpcService: TaskGrpcService;
  private readonly TIMEOUT_MS = 500000; // 5 seconds timeout for gRPC calls

  constructor(@Inject('TASK_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.taskGrpcService = this.client.getService<TaskGrpcService>('TaskService');
  }

  async create(dto: CreateTaskDto, user: any) {
    try {
      const userData = {
        userId: user.userId,
        email: user.email,
        role: user.role
      };

      const response = await firstValueFrom(
        this.taskGrpcService.CreateTask({ ...dto, user: userData }).pipe(
          timeout(this.TIMEOUT_MS),
          catchError(error => {
            if (error.details === 'Task with this title already exists') {
              throw new HttpException('Task with this title already exists', HttpStatus.CONFLICT);
            }
            throw new HttpException(error.details || 'Failed to create task', HttpStatus.INTERNAL_SERVER_ERROR);
          }),
        ),
      );
      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Task service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async findAll(user: any) {
    try {
      const userData = {
        userId: user.userId,
        email: user.email,
        role: user.role
      };

      const response = await firstValueFrom(
        this.taskGrpcService.GetAllTasks({ user: userData }).pipe(
          timeout(this.TIMEOUT_MS),
          catchError(error => {
            throw new HttpException(error.details || 'Failed to retrieve tasks', HttpStatus.INTERNAL_SERVER_ERROR);
          }),
        ),
      );
      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Task service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async findOne(id: number, user: any) {
    try {
      const userData = {
        userId: user.userId,
        email: user.email,
        role: user.role
      };

      const response = await firstValueFrom(
        this.taskGrpcService.GetTaskById({ id, user: userData }).pipe(
          timeout(this.TIMEOUT_MS),
          catchError(error => {
            if (error.details === 'Task not found') {
              throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
            }
            if (error.details === 'Permission denied') {
              throw new HttpException('Permission denied', HttpStatus.FORBIDDEN);
            }
            throw new HttpException(error.details || 'Failed to retrieve task', HttpStatus.INTERNAL_SERVER_ERROR);
          }),
        ),
      );
      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Task service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async update(id: number, dto: UpdateTaskDto, user: any) {
    try {
      const userData = {
        userId: user.userId,
        email: user.email,
        role: user.role
      };

      const response = await firstValueFrom(
        this.taskGrpcService.UpdateTask({ id, ...dto, user: userData }).pipe(
          timeout(this.TIMEOUT_MS),
          catchError(error => {
            if (error.details === 'Task not found') {
              throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
            }
            if (error.details === 'Permission denied') {
              throw new HttpException('Permission denied', HttpStatus.FORBIDDEN);
            }
            throw new HttpException(error.details || 'Failed to update task', HttpStatus.INTERNAL_SERVER_ERROR);
          }),
        ),
      );
      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Task service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async remove(id: number, user: any) {
    try {
      const userData = {
        userId: user.userId,
        email: user.email,
        role: user.role
      };

      const response = await firstValueFrom(
        this.taskGrpcService.DeleteTask({ id, user: userData }).pipe(
          timeout(this.TIMEOUT_MS),
          catchError(error => {
            if (error.details === 'Task not found') {
              throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
            }
            if (error.details === 'Permission denied') {
              throw new HttpException('Permission denied', HttpStatus.FORBIDDEN);
            }
            throw new HttpException(error.details || 'Failed to delete task', HttpStatus.INTERNAL_SERVER_ERROR);
          }),
        ),
      );
      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Task service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getAllTasksForAdmin() {
    try {
      const response = await firstValueFrom(
        this.taskGrpcService.GetAllTasksForAdmin({}).pipe(
          timeout(this.TIMEOUT_MS),
          catchError(error => {
            throw new HttpException(error.details || 'Failed to retrieve tasks', HttpStatus.INTERNAL_SERVER_ERROR);
          }),
        ),
      );
      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Task service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getTaskByIdForAdmin(id: number) {
    try {
      const response = await firstValueFrom(
        this.taskGrpcService.GetTaskByIdForAdmin({ id }).pipe(
          timeout(this.TIMEOUT_MS),
          catchError(error => {
            if (error.details === 'Task not found') {
              throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
            }
            throw new HttpException(error.details || 'Failed to retrieve task', HttpStatus.INTERNAL_SERVER_ERROR);
          }),
        ),
      );
      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Task service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async adminUpdateTask(id: number, dto: UpdateTaskDto) {
    try {
      const response = await firstValueFrom(
        this.taskGrpcService.AdminUpdateTask({ id, ...dto }).pipe(
          timeout(this.TIMEOUT_MS),
          catchError(error => {
            if (error.details === 'Task not found') {
              throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
            }
            throw new HttpException(error.details || 'Failed to update task', HttpStatus.INTERNAL_SERVER_ERROR);
          }),
        ),
      );
      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Task service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async adminDeleteTask(id: number) {
    try {
      const response = await firstValueFrom(
        this.taskGrpcService.AdminDeleteTask({ id }).pipe(
          timeout(this.TIMEOUT_MS),
          catchError(error => {
            if (error.details === 'Task not found') {
              throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
            }
            throw new HttpException(error.details || 'Failed to delete task', HttpStatus.INTERNAL_SERVER_ERROR);
          }),
        ),
      );
      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Task service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getAllTasksByUserId(userId: number) {
    try {
      const response = await firstValueFrom(
        this.taskGrpcService.GetAllTasksByUserId({ userId }).pipe(
          timeout(this.TIMEOUT_MS),
          catchError(error => {
            if (error.details === 'User not found') {
              throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }
            throw new HttpException(error.details || 'Failed to retrieve tasks', HttpStatus.INTERNAL_SERVER_ERROR);
          }),
        ),
      );
      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Task service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}