import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface SubtaskGrpcService {
  getSubtask(data: any): any;
  updateSubtask(data: any): any;
  deleteSubtask(data: any): any;
}

@Injectable()
export class SubtaskService {
  private subtaskGrpcService: SubtaskGrpcService;

  constructor(@Inject('TASK_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.subtaskGrpcService = this.client.getService<SubtaskGrpcService>('TaskService');
  }

  async getSubtask(id: number, user: any) {
    try {
      const userData = {
        userId: user.userId,
        email: user.email,
        role: user.role
      };

      return await firstValueFrom(
        this.subtaskGrpcService.getSubtask({ subtaskId: id, user: userData })
      );
    } catch (error) {
      throw new HttpException(error.message || 'Failed to get subtask', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateSubtask(id: number, dto: any, user: any) {
    try {
      const userData = {
        userId: user.userId,
        email: user.email,
        role: user.role
      };

      return await firstValueFrom(
        this.subtaskGrpcService.updateSubtask({
          subtaskId: id,
          content: dto.content,
          isCompleted: dto.isCompleted,
          user: userData
        })
      );
    } catch (error) {
      throw new HttpException(error.message || 'Failed to update subtask', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteSubtask(id: number, user: any) {
    try {
      const userData = {
        userId: user.userId,
        email: user.email,
        role: user.role
      };

      return await firstValueFrom(
        this.subtaskGrpcService.deleteSubtask({ subtaskId: id, user: userData })
      );
    } catch (error) {
      throw new HttpException(error.message || 'Failed to delete subtask', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}