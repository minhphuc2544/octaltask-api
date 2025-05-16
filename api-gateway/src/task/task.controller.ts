import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe
} from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtGuard } from '../guards/jwt.guard';
import { AdminGuard } from '../guards/admin.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse
} from '@nestjs/swagger';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentListResponseDto, CommentResponseDto } from './dto/comment-response.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('Task')
@ApiBearerAuth('accessToken')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiCreatedResponse({ 
    description: 'The task has been successfully created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Complete project documentation' },
        description: { type: 'string', example: 'Write comprehensive documentation for the microservice architecture' },
        isCompleted: { type: 'boolean', example: false },
        dueDate: { type: 'string', example: '2025-05-20T12:00:00Z' },
        user: {
          type: 'object',
          properties: {
            userId: { type: 'number', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            role: { type: 'string', example: 'user' }
          }
        }
      }
    }
  })
  @ApiConflictResponse({ description: 'Task with this title already exists' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ type: CreateTaskDto })
  async create(@Body(ValidationPipe) createTaskDto: CreateTaskDto, @Request() req) {
    return this.taskService.create(createTaskDto, req.user);
  }

  @Get()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all tasks for the current user' })
  @ApiOkResponse({ 
    description: 'Retrieved all tasks for the current user',
    schema: {
      type: 'object',
      properties: {
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              title: { type: 'string' },
              description: { type: 'string' },
              isCompleted: { type: 'boolean' },
              dueDate: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findAll(@Request() req) {
    return this.taskService.findAll(req.user);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Retrieved the task successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Complete project documentation' },
        description: { type: 'string', example: 'Write comprehensive documentation for the microservice architecture' },
        isCompleted: { type: 'boolean', example: false },
        dueDate: { type: 'string', example: '2025-05-20T12:00:00Z' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', example: 'user' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiForbiddenResponse({ description: 'Permission denied' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.taskService.findOne(parseInt(id, 10), req.user);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task ID', type: 'number' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiOkResponse({ 
    description: 'Task updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Updated project documentation' },
        description: { type: 'string', example: 'Updated documentation with new architecture diagrams' },
        isCompleted: { type: 'boolean', example: true },
        dueDate: { type: 'string', example: '2025-05-25T12:00:00Z' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', example: 'user' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiForbiddenResponse({ description: 'Permission denied' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async update(
    @Param('id') id: string, 
    @Body(ValidationPipe) updateTaskDto: UpdateTaskDto, 
    @Request() req
  ) {
    return this.taskService.update(parseInt(id, 10), updateTaskDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Task deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Task deleted successfully' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiForbiddenResponse({ description: 'Permission denied' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.taskService.remove(parseInt(id, 10), req.user);
  }

  // Admin routes
  @Get('admin/all')
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Get all tasks in the system' })
  @ApiOkResponse({ 
    description: 'Retrieved all tasks successfully',
    schema: {
      type: 'object',
      properties: {
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              title: { type: 'string' },
              description: { type: 'string' },
              isCompleted: { type: 'boolean' },
              dueDate: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin access required' })
  async getAllTasksForAdmin() {
    return this.taskService.getAllTasksForAdmin();
  }

  @Get('admin/:id')
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Get a task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Retrieved the task successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Complete project documentation' },
        description: { type: 'string', example: 'Write comprehensive documentation for the microservice architecture' },
        isCompleted: { type: 'boolean', example: false },
        dueDate: { type: 'string', example: '2025-05-20T12:00:00Z' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', example: 'user' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin access required' })
  async getTaskByIdForAdmin(@Param('id') id: string) {
    return this.taskService.getTaskByIdForAdmin(parseInt(id, 10));
  }

  @Patch('admin/:id')
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Update any task' })
  @ApiParam({ name: 'id', description: 'Task ID', type: 'number' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiOkResponse({ 
    description: 'Task updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Updated project documentation' },
        description: { type: 'string', example: 'Updated documentation with new architecture diagrams' },
        isCompleted: { type: 'boolean', example: true },
        dueDate: { type: 'string', example: '2025-05-25T12:00:00Z' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', example: 'user' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin access required' })
  async adminUpdateTask(
    @Param('id') id: string, 
    @Body(ValidationPipe) updateTaskDto: UpdateTaskDto
  ) {
    return this.taskService.adminUpdateTask(parseInt(id, 10), updateTaskDto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Delete any task' })
  @ApiParam({ name: 'id', description: 'Task ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Task deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Task deleted successfully' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin access required' })
  async adminDeleteTask(@Param('id') id: string) {
    return this.taskService.adminDeleteTask(parseInt(id, 10));
  }

  @Get('admin/user/:userId')
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Get all tasks by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Retrieved all tasks for the specified user',
    schema: {
      type: 'object',
      properties: {
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              title: { type: 'string' },
              description: { type: 'string' },
              isCompleted: { type: 'boolean' },
              dueDate: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin access required' })
  async getAllTasksByUserId(@Param('userId') userId: string) {
    return this.taskService.getAllTasksByUserId(parseInt(userId, 10));
  }

  @Post(':id/comments')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a comment to a task' })
  @ApiParam({ name: 'id', description: 'Task ID', type: 'number' })
  @ApiBody({ type: CreateCommentDto })
  @ApiCreatedResponse({ 
    description: 'Comment added successfully',
    type: CommentResponseDto
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiForbiddenResponse({ description: 'Permission denied to comment on this task' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async addCommentToTask(
    @Param('id') id: string,
    @Body(ValidationPipe) createCommentDto: CreateCommentDto,
    @Request() req
  ) {
    return this.taskService.addCommentToTask(parseInt(id, 10), createCommentDto, req.user);
  }

  @Get(':id/comments')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all comments for a task' })
  @ApiParam({ name: 'id', description: 'Task ID', type: 'number' })
  @ApiOkResponse({ 
    description: 'Retrieved all comments for the task',
    type: CommentListResponseDto
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiForbiddenResponse({ description: 'Permission denied to view comments on this task' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getCommentsForTask(@Param('id') id: string, @Request() req) {
    return this.taskService.getCommentsForTask(parseInt(id, 10), req.user);
  }

  @Patch(':taskId/comments/:commentId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a comment on a task' })
  @ApiParam({ name: 'taskId', description: 'Task ID', type: 'number' })
  @ApiParam({ name: 'commentId', description: 'Comment ID', type: 'number' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiOkResponse({ 
    description: 'Comment updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        content: { type: 'string', example: 'This is the updated comment text' },
        createdAt: { type: 'string', example: '2025-05-17T10:30:00Z' },
        user: {
          type: 'object',
          properties: {
            userId: { type: 'number', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', example: 'user' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Task or comment not found' })
  @ApiForbiddenResponse({ description: 'Permission denied to update this comment' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateComment(
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Body(ValidationPipe) updateCommentDto: UpdateCommentDto,
    @Request() req
  ) {
    return this.taskService.updateComment(
      parseInt(taskId, 10), 
      parseInt(commentId, 10), 
      updateCommentDto, 
      req.user
    );
  }
}