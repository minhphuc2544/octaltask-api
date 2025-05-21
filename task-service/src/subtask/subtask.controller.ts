import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SubtaskService } from './subtask.service';

@Controller()
export class SubtaskController {
  constructor(private readonly subtaskService: SubtaskService) {}

  @GrpcMethod('TaskService', 'GetSubtask')
  async getSubtask(data: { subtaskId: number; user: any }) {
    try {
      if (!data.subtaskId || typeof data.subtaskId !== 'number') {
        throw new Error('Invalid subtask ID format');
      }

      if (!data.user || !data.user.userId) {
        throw new Error('User information missing from request');
      }

      return await this.subtaskService.getSubtask(data.subtaskId, data.user);
    } catch (error) {
      throw new Error(error.message || 'Failed to get subtask');
    }
  }

  @GrpcMethod('TaskService', 'UpdateSubtask')
  async updateSubtask(data: { subtaskId: number; content: string; isCompleted: boolean; user: any }) {
    try {
      if (!data.subtaskId || typeof data.subtaskId !== 'number') {
        throw new Error('Invalid subtask ID format');
      }

      if (!data.user || !data.user.userId) {
        throw new Error('User information missing from request');
      }

      return await this.subtaskService.updateSubtask(
        data.subtaskId,
        { content: data.content, isCompleted: data.isCompleted },
        data.user
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to update subtask');
    }
  }

  @GrpcMethod('TaskService', 'DeleteSubtask')
  async deleteSubtask(data: { subtaskId: number; user: any }) {
    try {
      if (!data.subtaskId || typeof data.subtaskId !== 'number') {
        throw new Error('Invalid subtask ID format');
      }

      if (!data.user || !data.user.userId) {
        throw new Error('User information missing from request');
      }

      return await this.subtaskService.deleteSubtask(data.subtaskId, data.user);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete subtask');
    }
  }
}