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
    ParseIntPipe,
  } from '@nestjs/common'
import { TaskService } from './task.service'
import { CreateTaskDto } from 'src/dto/create-task.dto'
import { UpdateTaskDto } from 'src/dto/update-task.dto'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { promises } from 'dns'
import { User } from 'src/entities/user.entity'


@UseGuards(JwtAuthGuard)

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateTaskDto, @Request() req): Promise<any>
   {
    console.log('User info:', req.user);
    console.log('CreateTaskDto:', dto);
    console.log('User:', req.user);
    return await this.taskService.create(dto, req.user)
  }

  @Get()
  async findAll(@Request() req) {
    return this.taskService.findAllByUser(req.user)
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.taskService.findOne(id, req.user)
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
    @Request() req
  ) {
    return this.taskService.update(id, dto, req.user)
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.taskService.remove(id, req.user)
  }
}