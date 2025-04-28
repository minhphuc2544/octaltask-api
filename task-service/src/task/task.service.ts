import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from 'src/dto/create-task.dto';
import { UpdateTaskDto } from 'src/dto/update-task.dto';
import { Task } from 'src/entities/task.entity';
import { User } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'



@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)    private taskRepo: Repository<Task>
  ) {}

  // create(dto: CreateTaskDto, user: User) {
  //   const task = this.taskRepo.create({ ...dto, user })
  //   return this.taskRepo.save(task)
  // }
 async create(dto: CreateTaskDto, user: { userId: number }) :Promise<any>{
    const task = this.taskRepo.create({
      ...dto,
      user: { id: user.userId }, 
      
    });
    return await this.taskRepo.save(task);
  }
  

  async findAllByUser(user: User) {
    return this.taskRepo.find({ where: { user } })
  }

  async findOne(id: number, user: User) {
    return this.taskRepo.findOne({ where: { id, user } })
  }

  async update(id: number, dto: UpdateTaskDto, user: User) {
    return this.taskRepo.update({ id, user }, dto)
  }

  async remove(id: number, user: User) {
    const task = await this.findOne(id, user)
    if (task) {
      return this.taskRepo.remove(task)
    }
  }
}