import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface CommentGrpcService {
  getComment(data: any): any;
  updateComment(data: any): any;
  deleteComment(data: any): any;
}

@Injectable()
export class CommentService {
  private commentGrpcService: CommentGrpcService;

  constructor(@Inject('TASK_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.commentGrpcService = this.client.getService<CommentGrpcService>('TaskService');
  }

  async getComment(id: number, user: any) {
    try {
      const userData = {
        userId: user.userId,
        email: user.email,
        role: user.role
      };

      return await firstValueFrom(
        this.commentGrpcService.getComment({ commentId: id, user: userData })
      );
    } catch (error) {
      throw new HttpException(error.message || 'Failed to get comment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateComment(id: number, dto: any, user: any) {
    try {
      const userData = {
        userId: user.userId,
        email: user.email,
        role: user.role
      };

      return await firstValueFrom(
        this.commentGrpcService.updateComment({
          commentId: id,
          content: dto.content,
          user: userData
        })
      );
    } catch (error) {
      throw new HttpException(error.message || 'Failed to update comment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteComment(id: number, user: any) {
    try {
      const userData = {
        userId: user.userId,
        email: user.email,
        role: user.role
      };

      return await firstValueFrom(
        this.commentGrpcService.deleteComment({ commentId: id, user: userData })
      );
    } catch (error) {
      throw new HttpException(error.message || 'Failed to delete comment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}