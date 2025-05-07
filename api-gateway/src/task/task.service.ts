
import { Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  private taskGrpcService: any;

  constructor(@Inject('TASK_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.taskGrpcService = this.client.getService('TaskService');
  }

  async create(dto: CreateTaskDto, user: any) {
    return this.taskGrpcService.createTask({ ...dto, user });
  }

  async findAll(user: any) {
    return this.taskGrpcService.getAllTasks({ user });
  }

  async findOne(id: number, user: any) {
    return this.taskGrpcService.getTaskById({ id, user });
  }

  async update(id: number, dto: UpdateTaskDto, user: any) {
    return this.taskGrpcService.updateTask({ id, ...dto, user });
  }

  async remove(id: number, user: any) {
    return this.taskGrpcService.deleteTask({ id, user });
  }

  async getAllTasksForAdmin() {
    return this.taskGrpcService.getAllTasksForAdmin({});
  }

  async adminDeleteTask(id: number) {
    return this.taskGrpcService.adminDeleteTask({ id });
  }

  async adminUpdateTask(id: number, dto: UpdateTaskDto) {
    return this.taskGrpcService.adminUpdateTask({ id, ...dto });
  }

  async adminGetTaskById(id: number) {
    return this.taskGrpcService.getTaskByIdForAdmin({ id });
  }

  async getAllTasksByUserId(userId: number) {
    return this.taskGrpcService.getAllTasksByUserId({ userId });
  }
}
