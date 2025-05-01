import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common'
import { TaskService } from './task.service'
import { CreateTaskDto } from 'src/dto/create-task.dto'
import { UpdateTaskDto } from 'src/dto/update-task.dto'
import { JwtGuard } from '../guards/jwt.guard'
import { Request } from 'express'
import { Task } from 'src/entities/task.entity'
import { AdminGuard } from 'src/guards/admin.guard'



@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(JwtGuard)
  @Post()
  async create(@Body() dto: CreateTaskDto, @Req() req: Request): Promise<Task> {
    // object deserialization to get the user's info that are returned from JwtStrategy
    const user = req.user as { userId: number, email: string, role: string }
    return await this.taskService.create(dto, user)
  }

  @UseGuards(JwtGuard)
  @Get()
  async findAll(@Req() req: Request): Promise<Task[]> {
    const user = req.user as { userId: number, email: string, role: string };
    return await this.taskService.findAll(user);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request): Promise<Task> {
    const user = req.user as { userId: number, email: string, role: string };
    return await this.taskService.findOne(id, user);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: Request,
  ): Promise<Task> {
    const user = req.user as { userId: number, email: string, role: string };
    return await this.taskService.update(id, updateTaskDto, user);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request): Promise<void> {
    const user = req.user as { userId: number, email: string, role: string };
    return await this.taskService.remove(id, user);
  }

  
  @UseGuards(JwtGuard, AdminGuard)
  @Get('/admin/all')
  async getAllTasksForAdmin(): Promise<Task[]> {
  return await this.taskService.getAllTasksForAdmin();
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Delete('/admin/:id')
  async adminDeleteTask(@Param('id', ParseIntPipe) id: number): Promise<void> {
  return await this.taskService.adminDeleteTask(id);
  }

}
