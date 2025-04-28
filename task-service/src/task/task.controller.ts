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



@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @UseGuards(JwtGuard)
  @Post('create')
  async create(@Body() dto: CreateTaskDto, @Req() req: Request): Promise<Task> {
    // object deserialization to get the user's info that are returned from JwtStrategy
    const user = req.user as { userId: number, email: string, role: string }
    console.log('User info:', user);
    console.log('CreateTaskDto:', dto);
    console.log('User:', user);
    return await this.taskService.create(dto, user)
  }
}