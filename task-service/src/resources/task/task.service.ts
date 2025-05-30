import { ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { User } from '../../entities/user.entity';
import { Comment } from '../../entities/comment.entity';
import { Subtask } from '../../entities/subtask.entity';
import { List } from '../../entities/list.entity'; // Import List entity
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
    @InjectRepository(List)
    private listRepo: Repository<List>, // Inject List repository
    @Inject('USER_INFO_PACKAGE') private readonly client: ClientGrpc
  ) { }

  onModuleInit() {
    this.userGrpcService = this.client.getService<UserGrpcService>('UserService');
  }

  private async validateUserExists(userId: number): Promise<UserInfo | any> {
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

  private async getUsersByIds(userIds: number[]): Promise<UserInfo[] | any> {
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
      ) as { users: UserInfo[] };

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

  // Validate if list exists and belongs to user
  private async validateListOwnership(listId: number, userId: number): Promise<List> {
    const list = await this.listRepo.findOne({
      where: {
        id: listId,
        user: { id: userId }
      },
      relations: ['user']
    });

    if (!list) {
      throw new NotFoundException('List not found or you do not have permission to access it');
    }

    return list;
  }

  #Task
  async create(createTaskDto: CreateTaskDto, user: TaskUser) {
    const userInfo = await this.validateUserExists(user.userId);
    if (!userInfo) {
      throw new NotFoundException('User not found');
    }
    // Validate list ownership
    const list = await this.validateListOwnership(createTaskDto.listId!, user.userId);

    const task = this.taskRepo.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      isCompleted: createTaskDto.isCompleted || false,
      isStarted: createTaskDto.isStarted || false,
      dueDate: createTaskDto.dueDate,
      userId: user.userId,
      list: list // Assign list to task
    });
    const savedTask = await this.taskRepo.save(task);
    //console.log(savedTask.list);
    return {
      id: savedTask.id,
      title: savedTask.title,
      description: savedTask.description,
      isCompleted: savedTask.isCompleted,
      isStarted: savedTask.isStarted,
      dueDate: savedTask.dueDate,
      userId: savedTask.userId,
      listId: savedTask.list?.id ?? null
    };
  }

  async findAll(user: TaskUser) {
    const tasks = await this.taskRepo.find({
      where: {
        userId: user.userId,
      },
      relations: ['list'], // Để truy cập list.id
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      isCompleted: task.isCompleted,
      isStarted: task.isStarted,
      dueDate: task.dueDate?.toISOString(),
      userId: task.userId,
      listId: task.list?.id ?? null,
    }));
  }


  async findOne(id: number, user: TaskUser) {
    const task = await this.taskRepo.findOne({
      where: {
        id,
        userId: user.userId
      },
      relations: ['list'],
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        isStarted: true,
        dueDate: true,
        userId: true,
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return {
      ...task,
      listId: task.list?.id ?? null,
    };
  }


  async update(id: number, updateTaskDto: UpdateTaskDto, user: TaskUser) {
    // First, find the task to ensure it exists and belongs to the user
    const task = await this.taskRepo.findOne({
      where: {
        id,
        userId: user.userId
      },
      relations: ['list']
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // If listId is provided, validate the new list ownership
    if (updateTaskDto.listId !== undefined) {
      const newList = await this.validateListOwnership(updateTaskDto.listId, user.userId);
      task.list = newList;
    }
    // If listId is not provided, keep the current list (no change)

    // Update other fields
    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title;
    }
    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description;
    }
    if (updateTaskDto.isCompleted !== undefined) {
      task.isCompleted = updateTaskDto.isCompleted;
    }
    if (updateTaskDto.isStarted !== undefined) {
      task.isStarted = updateTaskDto.isStarted;
    }
    task.dueDate = new Date();
    
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
      relations: ['list'],
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        isStarted: true,
        dueDate: true,
        userId: true,
        list: {
          id: true,
          name: true,
          icon: true,
          color: true
        }
      }
    });
  }

  async getTaskByIdForAdmin(id: number) {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['list'],
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        isStarted: true,
        dueDate: true,
        userId: true,
        list: {
          id: true,
          name: true,
          icon: true,
          color: true
        }
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
      relations: ['list']
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // If listId is provided, validate the list exists (admin can move task to any list)
    if (updateTaskDto.listId !== undefined) {
      const newList = await this.listRepo.findOne({
        where: { id: updateTaskDto.listId }
      });

      if (!newList) {
        throw new NotFoundException('List not found');
      }

      task.list = newList;
    }

    // Update other fields
    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title;
    }
    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description;
    }
    if (updateTaskDto.isCompleted !== undefined) {
      task.isCompleted = updateTaskDto.isCompleted;
    }
     if (updateTaskDto.isStarted !== undefined) {
      task.isStarted = updateTaskDto.isStarted;
    }
    if (updateTaskDto.dueDate !== undefined) {
      task.dueDate = new Date(updateTaskDto.dueDate);
    }
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
      relations: ['list'],
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        isStarted: true,
        dueDate: true,
        userId: true,
        list: {
          id: true,
          name: true,
          icon: true,
          color: true
        }
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
      taskId: task.id,
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
      isCompleted: subtask.isCompleted,
      createdAt: subtask.createdAt.toISOString(),
      taskId: task.id,
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
      taskId: task.id,
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
      taskId: task.id,
      user: {
        userId: comment.user.id,
        email: comment.user.email,
        name: comment.user.name,
        role: comment.user.role
      }
    }));
  }
}