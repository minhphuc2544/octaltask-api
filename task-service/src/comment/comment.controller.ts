import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CommentService } from './comment.service';

@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @GrpcMethod('TaskService', 'GetComment')
  async getComment(data: { commentId: number; user: any }) {
    try {
      if (!data.commentId || typeof data.commentId !== 'number') {
        throw new Error('Invalid comment ID format');
      }

      if (!data.user || !data.user.userId) {
        throw new Error('User information missing from request');
      }

      return await this.commentService.getComment(data.commentId, data.user);
    } catch (error) {
      throw new Error(error.message || 'Failed to get comment');
    }
  }

  @GrpcMethod('TaskService', 'UpdateComment')
  async updateComment(data: { commentId: number; content: string; user: any }) {
    try {
      if (!data.commentId || typeof data.commentId !== 'number') {
        throw new Error('Invalid comment ID format');
      }

      if (!data.content) {
        throw new Error('Comment content is required');
      }

      if (!data.user || !data.user.userId) {
        throw new Error('User information missing from request');
      }

      return await this.commentService.updateComment(
        data.commentId,
        { content: data.content },
        data.user
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to update comment');
    }
  }

  @GrpcMethod('TaskService', 'DeleteComment')
  async deleteComment(data: { commentId: number; user: any }) {
    try {
      if (!data.commentId || typeof data.commentId !== 'number') {
        throw new Error('Invalid comment ID format');
      }

      if (!data.user || !data.user.userId) {
        throw new Error('User information missing from request');
      }

      return await this.commentService.deleteComment(data.commentId, data.user);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete comment');
    }
  }
}