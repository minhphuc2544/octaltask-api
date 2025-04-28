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


@UseGuards(JwtGuard)

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @UseGuards(JwtGuard)
  @Post()
  async create(@Body() dto: CreateTaskDto, @Req() req: Request): Promise<Task> {
    // object deserialization to get the user's info that are returned from JwtStrategy
    const user = req.user as { userId: number, email: string, role: string }
    console.log('User info:', req.user);
    console.log('CreateTaskDto:', dto);
    console.log('User:', req.user);
    return await this.taskService.create(dto, user)
  }

  // @Get()
  // async findAll(@Req() req: Request) {
  //   return this.taskService.findAllByUser(user)
  // }

  // @Get(':id')
  // async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
  //   return this.taskService.findOne(id, user)
  // }

  // @Patch(':id')
  // async update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() dto: UpdateTaskDto,
  //   @Req() req: Request
  // ) {
  //   return this.taskService.update(id, dto, user)
  // }

  // @Delete(':id')
  // async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
  //   return this.taskService.remove(id, user)
  // }
}