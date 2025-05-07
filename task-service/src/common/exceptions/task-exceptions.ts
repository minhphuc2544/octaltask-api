
import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export class TaskNotFoundException extends RpcException {
  constructor(id: number) {
    super({
      code: HttpStatus.NOT_FOUND,
      message: `Task with ID ${id} not found`,
      details: { taskId: id }
    });
  }
}

export class TaskAccessDeniedException extends RpcException {
  constructor(id: number, userId: number) {
    super({
      code: HttpStatus.FORBIDDEN,
      message: 'Access to requested task denied',
      details: { taskId: id, userId }
    });
  }
}

export class InvalidTaskDataException extends RpcException {
  constructor(details: Record<string, any>) {
    super({
      code: HttpStatus.BAD_REQUEST,
      message: 'Invalid task data provided',
      details
    });
  }
}