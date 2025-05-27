import { Injectable, Inject, HttpException, HttpStatus, NotFoundException, ForbiddenException } from '@nestjs/common';
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
      this.handleGrpcError(error);
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
      this.handleGrpcError(error);
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
      this.handleGrpcError(error);
    }
  }

  private handleGrpcError(error: any) {
    // Extract gRPC error details
    const grpcError = error.details || error.message || 'Unknown error';
    const grpcCode = error.code;

    // Map gRPC status codes to HTTP status codes
    switch (grpcCode) {
      case 5: // NOT_FOUND
        throw new NotFoundException(grpcError);
      case 7: // PERMISSION_DENIED
        throw new ForbiddenException(grpcError);
      case 3: // INVALID_ARGUMENT
        throw new HttpException(grpcError, HttpStatus.BAD_REQUEST);
      case 13: // INTERNAL
      default:
        throw new HttpException(grpcError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}