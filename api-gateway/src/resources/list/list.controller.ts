// src/task/list.controller.ts - Updated with sharing features
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { ListService } from './list.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { ShareListDto } from './dto/share-list.dto';
import { UpdateSharedRoleDto } from './dto/update-shared-role.dto';
import { JwtGuard } from '../../guards/jwt.guard';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('lists')
@Controller('lists')
export class ListController {
  constructor(private readonly listService: ListService) { }

  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new list' })
  @ApiCreatedResponse({
    description: 'The list has been successfully created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Personal Tasks' },
        icon: { type: 'string', example: 'personal' },
        color: { type: 'string', example: 'blue' },
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
  @ApiConflictResponse({ description: 'List with this name already exists' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ type: CreateListDto })
  async create(@Body(ValidationPipe) createListDto: CreateListDto, @Request() req) {
    const something = await this.listService.create(createListDto, req.user);
    return something;
  }

  @Get()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all lists for the current user' })
  @ApiOkResponse({
    description: 'Retrieved all lists for the current user',
    schema: {
      type: 'object',
      properties: {
        lists: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              icon: { type: 'string' },
              color: { type: 'string' },
              dueDate: { type: 'string' },
              userRole: { type: 'string', enum: ['owner', 'admin', 'editor', 'viewer'] },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' }
                }
              },
              sharedUsers: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    userId: { type: 'number' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                    role: { type: 'string', enum: ['admin', 'editor', 'viewer'] },
                    sharedAt: { type: 'string' }
                  }
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
    return this.listService.findAll(req.user);
  }

  @Get('shared')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all shared lists for the current user' })
  @ApiOkResponse({
    description: 'Retrieved all shared lists for the current user',
    schema: {
      type: 'object',
      properties: {
        lists: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              icon: { type: 'string' },
              color: { type: 'string' },
              dueDate: { type: 'string' },
              userRole: { type: 'string', enum: ['admin', 'editor', 'viewer'] },
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
  async getSharedLists(@Request() req) {
    return this.listService.getSharedLists(req.user);
  }

  @Get('users/search')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search users by email for sharing' })
  @ApiQuery({ name: 'email', description: 'Email to search for', type: 'string' })
  @ApiOkResponse({
    description: 'Users found',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              email: { type: 'string' },
              name: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async searchUsers(@Query('email') email: string) {
    return this.listService.getUsersByEmail(email);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a list by ID' })
  @ApiParam({ name: 'id', description: 'List ID', type: 'number' })
  @ApiOkResponse({
    description: 'Retrieved the list successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Personal Tasks' },
        icon: { type: 'string', example: 'personal' },
        color: { type: 'string', example: 'blue' },
        dueDate: { type: 'string', example: '2025-05-20T12:00:00Z' },
        userRole: { type: 'string', enum: ['owner', 'admin', 'editor', 'viewer'] },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', example: 'user' }
          }
        },
        sharedUsers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'number' },
              email: { type: 'string' },
              name: { type: 'string' },
              role: { type: 'string', enum: ['admin', 'editor', 'viewer'] },
              sharedAt: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'List not found' })
  @ApiForbiddenResponse({ description: 'Permission denied' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.listService.findOne(parseInt(id, 10), req.user);
  }

  @Get(':id/shared-users')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users who have access to a list' })
  @ApiParam({ name: 'id', description: 'List ID', type: 'number' })
  @ApiOkResponse({
    description: 'Retrieved shared users successfully',
    schema: {
      type: 'object',
      properties: {
        sharedUsers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'number' },
              email: { type: 'string' },
              name: { type: 'string' },
              role: { type: 'string', enum: ['admin', 'editor', 'viewer'] },
              sharedAt: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'List not found' })
  @ApiForbiddenResponse({ description: 'Permission denied' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getListSharedUsers(@Param('id') id: string, @Request() req) {
    return this.listService.getListSharedUsers(parseInt(id, 10), req.user);
  }

  @Post(':id/share')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Share a list with another user' })
  @ApiParam({ name: 'id', description: 'List ID', type: 'number' })
  @ApiBody({ type: ShareListDto })
  @ApiCreatedResponse({
    description: 'List shared successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'List shared successfully' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'List not found or User not found' })
  @ApiForbiddenResponse({ description: 'Permission denied' })
  @ApiConflictResponse({ description: 'List is already shared with this user' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async shareList(
    @Param('id') id: string,
    @Body(ValidationPipe) shareListDto: ShareListDto,
    @Request() req
  ) {
    return this.listService.shareList(parseInt(id, 10), shareListDto.email, shareListDto.role, req.user);
  }

  @Patch(':id/shared-users/:userId/role')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update the role of a shared user' })
  @ApiParam({ name: 'id', description: 'List ID', type: 'number' })
  @ApiParam({ name: 'userId', description: 'User ID', type: 'number' })
  @ApiBody({ type: UpdateSharedRoleDto })
  @ApiOkResponse({
    description: 'Role updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Role updated successfully' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'List not found or Shared user not found' })
  @ApiForbiddenResponse({ description: 'Permission denied' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateSharedRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body(ValidationPipe) updateSharedRoleDto: UpdateSharedRoleDto,
    @Request() req
  ) {
    return this.listService.updateSharedRole(
      parseInt(id, 10),
      parseInt(userId, 10),
      updateSharedRoleDto.role,
      req.user
    );
  }

  @Delete(':id/shared-users/:userId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a user from shared list access' })
  @ApiParam({ name: 'id', description: 'List ID', type: 'number' })
  @ApiParam({ name: 'userId', description: 'User ID', type: 'number' })
  @ApiOkResponse({
    description: 'User removed from list successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User removed from list successfully' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'List not found or Shared user not found' })
  @ApiForbiddenResponse({ description: 'Permission denied' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async removeSharedUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req
  ) {
    return this.listService.removeSharedUser(parseInt(id, 10), parseInt(userId, 10), req.user);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a list' })
  @ApiParam({ name: 'id', description: 'List ID', type: 'number' })
  @ApiBody({ type: UpdateListDto })
  @ApiOkResponse({
    description: 'List updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Updated Personal Tasks' },
        icon: { type: 'string', example: 'work' },
        color: { type: 'string', example: 'green' },
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
  @ApiNotFoundResponse({ description: 'List not found' })
  @ApiForbiddenResponse({ description: 'Permission denied' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateListDto: UpdateListDto,
    @Request() req
  ) {
    return this.listService.update(parseInt(id, 10), updateListDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a list' })
  @ApiParam({ name: 'id', description: 'List ID', type: 'number' })
  @ApiOkResponse({
    description: 'List deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'List deleted successfully' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'List not found' })
  @ApiForbiddenResponse({ description: 'Permission denied' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.listService.remove(parseInt(id, 10), req.user);
  }
}