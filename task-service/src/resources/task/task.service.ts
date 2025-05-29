import { ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { User } from '../../entities/user.entity';
import { Comment } from '../../entities/comment.entity';
import { Subtask } from '../../entities/subtask.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskUser } from './task.controller';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';

interface UserGrpcService {
  getUserByIdInfo(data: { id: number }): any;
  getUsersByIds(data: { ids: number[] }): any;
  validateUser(data: { userId: number; email?: string }): any;
  checkUserExists(data: { userId: number }): any;
}

interface UserInfo {
  id: number;
  email: string;
  name: string;
  role: string;
}

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  private userGrpcService: UserGrpcService;
  
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
    @InjectRepository(Subtask)
    private subtaskRepo: Repository<Subtask>,
    @Inject('USER_INFO_PACKAGE') private readonly client: ClientGrpc
    
  ) { }

  onModuleInit() {
    this.userGrpcService = this.client.getService<UserGrpcService>('UserService');
  }
  private async validateUserExists(userId: number): Promise<UserInfo|any> {
    try {
      this.logger.debug(`Validating user with ID: ${userId}`);
      
      const response = await firstValueFrom(
        this.userGrpcService.getUserByIdInfo({ id: userId }).pipe(
          timeout(5000), // 5 second timeout
          catchError((error) => {
            this.logger.error(`Failed to validate user ${userId}:`, error);
            throw error;
          })
        )
      );
      
      this.logger.debug(`User validation successful for ID: ${userId}`);
      return response;
    } catch (error) {
      this.logger.error(`User validation failed for ID ${userId}:`, error.message);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  private async getUsersByIds(userIds: number[]): Promise<UserInfo[]|any> {
    if (userIds.length === 0) return [];
    
    try {
      this.logger.debug(`Fetching users with IDs: ${userIds.join(', ')}`);
      
      const response = await firstValueFrom(
        this.userGrpcService.getUsersByIds({ ids: userIds }).pipe(
          timeout(5000),
          catchError((error) => {
            this.logger.error('Failed to fetch users:', error);
            throw error;
          })
        )
      )as { users: UserInfo[] };
      
      this.logger.debug(`Successfully fetched ${response.users?.length || 0} users`);
      return response.users || [];
    } catch (error) {
      this.logger.error('Failed to fetch users by IDs:', error.message);
      return []; // Return empty array if user service is unavailable
    }
  }

  private async checkUserPermission(taskUserId: number, requestingUserId: number, userRole: string): Promise<boolean> {
    return taskUserId === requestingUserId || userRole === 'admin';
  }

  async create(createTaskDto: CreateTaskDto, user: TaskUser) {
    const userInfo = await this.validateUserExists(user.userId);
    if (!userInfo) {
      throw new NotFoundException('User not found');
    }

    const task = this.taskRepo.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      isCompleted: createTaskDto.isCompleted || false,
      dueDate: createTaskDto.dueDate,
      userId: user.userId,
    });
    return await this.taskRepo.save(task);
  }

  async findAll(user: TaskUser) {
    return await this.taskRepo.find({
      where: {
        userId: user.userId ,
      },
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        dueDate: true,
        userId:true
        
      }
    });
  }

  async findOne(id: number, user: TaskUser) {
    const task = await this.taskRepo.findOne({
      where: {
        id,
        userId: user.userId 
      },
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        dueDate: true,
        userId: true
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, user: TaskUser) {
    // First, find the task to ensure it exists and belongs to the user
    const task = await this.taskRepo.findOne({
      where: {
        id,
        userId:user.userId 
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Update the task
    Object.assign(task, updateTaskDto);

    return await this.taskRepo.save(task);
  }

  async remove(id: number, user: TaskUser) {
    // First, find the task to ensure it exists and belongs to the user
    const task = await this.taskRepo.findOne({
      where: {
        id,
        userId: user.userId 
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Delete the task
    await this.taskRepo.remove(task);

    return { success: true };
  }

  async getAllTasksForAdmin() {
    return await this.taskRepo.find({
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        dueDate: true,
        userId: true
      }
    });
  }

  async getTaskByIdForAdmin(id: number) {
    const task = await this.taskRepo.findOne({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        dueDate: true,
        userId: true,
        
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async adminUpdateTask(id: number, updateTaskDto: UpdateTaskDto) {
    // First, find the task to ensure it exists
    const task = await this.taskRepo.findOne({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Update the task
    Object.assign(task, updateTaskDto);

    return await this.taskRepo.save(task);
  }

  async adminDeleteTask(id: number) {
    const task = await this.taskRepo.findOne({
      where: { id }
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    await this.taskRepo.remove(task);
    return { success: true };
  }

  async getAllTasksByUserId(userId: number) {
    const tasks = await this.taskRepo.find({
      where: {
        userId: userId 
      },
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        dueDate: true,
        userId: true
      }
    });

    return tasks;
  }

  async addSubtaskToTask(taskId: number, content: string, isCompleted: boolean, userInfo: { userId: number; email?: string; role?: string }) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!await this.checkUserPermission(task.userId, userInfo.userId, userInfo.role!)) {
      throw new ForbiddenException('Permission denied to subtask on this task');
    }

    const user = await this.userRepo.findOneBy({ id: userInfo.userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const subtask = this.subtaskRepo.create({
      content,
      isCompleted,
      task,
      user
    });

    const savedSubtask = await this.subtaskRepo.save(subtask);

    return {
      id: savedSubtask.id,
      content: savedSubtask.content,
      isComplete: savedSubtask.isCompleted,
      createdAt: savedSubtask.createdAt.toISOString(),
      user: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async getSubtasksForTask(taskId: number, userInfo: { userId: number; email?: string; role?: string }) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!await this.checkUserPermission(task.userId, userInfo.userId, userInfo.role!)) {
      throw new ForbiddenException('Permission denied to view subtasks on this task');
    }

    const subtasks = await this.subtaskRepo.find({
      where: { task: { id: taskId } },
      relations: ['user'],
      select: {
        id: true,
        content: true,
        isCompleted: true,
        createdAt: true,
        user: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      },
      order: {
        createdAt: 'DESC'
      }
    });

    return subtasks.map(subtask => ({
      id: subtask.id,
      content: subtask.content,
      isCompleted:subtask.isCompleted,
      createdAt: subtask.createdAt.toISOString(),
      user: {
        userId: subtask.user.id,
        email: subtask.user.email,
        name: subtask.user.name,
        role: subtask.user.role
      }
    }));
  }

  async addCommentToTask(taskId: number, content: string, userInfo: { userId: number; email?: string; role?: string }) {
    // Find the task
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if the user has permission to comment on this task
    // Users can comment on their own tasks or admins can comment on any task
    if (!await this.checkUserPermission(task.userId, userInfo.userId, userInfo.role!)) {
      throw new ForbiddenException('Permission denied to comment on this task');
    }

    // Find the user
    const user = await this.userRepo.findOneBy({ id: userInfo.userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create and save the comment
    const comment = this.commentRepo.create({
      content,
      task,
      user
    });

    const savedComment = await this.commentRepo.save(comment);

    // Format the response
    return {
      id: savedComment.id,
      content: savedComment.content,
      createdAt: savedComment.createdAt.toISOString(),
      user: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async getCommentsForTask(taskId: number, userInfo: { userId: number; email?: string; role?: string }) {
    // Find the task
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if the user has permission to view comments on this task
    // Users can view comments on their own tasks or admins can view comments on any task
   if (!await this.checkUserPermission(task.userId, userInfo.userId, userInfo.role!)) {
      throw new ForbiddenException('Permission denied to view comments on this task');
    }

    // Find all comments for this task
    const comments = await this.commentRepo.find({
      where: { task: { id: taskId } },
      relations: ['user'],
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      },
      order: {
        createdAt: 'DESC'
      }
    });

    // Format the response
    return comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      user: {
        userId: comment.user.id,
        email: comment.user.email,
        name: comment.user.name,
        role: comment.user.role
      }
    }));
  }
}