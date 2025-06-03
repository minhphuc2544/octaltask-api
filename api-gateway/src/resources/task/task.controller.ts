import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Request, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtGuard } from '../../guards/jwt.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createTaskDto: CreateTaskDto, @Request() req) {
    return this.taskService.create(createTaskDto, req.user);
  }

  @Get()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async findAll(@Request() req) {
    return this.taskService.findAll(req.user);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string, @Request() req) {
    return this.taskService.findOne(parseInt(id, 10), req.user);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
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
  async remove(@Param('id') id: string, @Request() req) {
    return this.taskService.remove(parseInt(id, 10), req.user);
  }

  // Admin routes
  @Get('admin/all')
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async getAllTasksForAdmin() {
    return this.taskService.getAllTasksForAdmin();
  }

  @Get('admin/:id')
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async getTaskByIdForAdmin(@Param('id') id: string) {
    return this.taskService.getTaskByIdForAdmin(parseInt(id, 10));
  }

  @Patch('admin/:id')
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async adminUpdateTask(
    @Param('id') id: string,
    @Body(ValidationPipe) updateTaskDto: UpdateTaskDto
  ) {
    return this.taskService.adminUpdateTask(parseInt(id, 10), updateTaskDto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async adminDeleteTask(@Param('id') id: string) {
    return this.taskService.adminDeleteTask(parseInt(id, 10));
  }

  @Get('admin/user/:userId')
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async getAllTasksByUserId(@Param('userId') userId: string) {
    return this.taskService.getAllTasksByUserId(parseInt(userId, 10));
  }

  @Post(':id/comments')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
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
  async getCommentsForTask(@Param('id') id: string, @Request() req) {
    return this.taskService.getCommentsForTask(parseInt(id, 10), req.user);
  }

  @Post(':id/subtasks')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async addSubtaskToTask(
    @Param('id') id: string,
    @Body(ValidationPipe) createSubtaskDto: CreateSubtaskDto,
    @Request() req
  ) {
    return this.taskService.addSubtaskToTask(parseInt(id, 10), createSubtaskDto, req.user);
  }

  @Get(':id/subtasks')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async getSubtasksForTask(@Param('id') id: string, @Request() req) {
    return this.taskService.getSubtasksForTask(parseInt(id, 10), req.user);
  }
}