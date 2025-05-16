import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from './entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Comment } from './entities/comment.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';

interface TaskUser {
  userId: number;
  email?: string;
  role?: string;
}

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>
  ) { }

  async create(createTaskDto: CreateTaskDto, user: TaskUser) {
    const userEntity = await this.userRepo.findOneBy({ id: user.userId });
    if (!userEntity) {
      throw new NotFoundException('User not found');
    }

    const task = this.taskRepo.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      isCompleted: createTaskDto.isCompleted || false,
      dueDate: createTaskDto.dueDate,
      user: userEntity,
    });
    return await this.taskRepo.save(task);
  }
           
  async findAll(user: TaskUser) {
    return await this.taskRepo.find({
      where: {
        user: { id: user.userId },
      },
      relations: ['user'],
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        dueDate: true,
        user: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      }
    });
  }

  async findOne(id: number, user: TaskUser) {
    const task = await this.taskRepo.findOne({
      where: {
        id,
        user: { id: user.userId }
      },
      relations: ['user'],
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        dueDate: true,
        user: {
          id: true,
          email: true,
          name: true,
          role: true
        }
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
        user: { id: user.userId }
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
        user: { id: user.userId }
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
      relations: ['user'],
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        dueDate: true,
        user: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      }
    });
  }

  async getTaskByIdForAdmin(id: number) {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['user'],
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        dueDate: true,
        user: {
          id: true,
          email: true,
          name: true,
          role: true
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
      relations: ['user']
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Update the task
    Object.assign(task, updateTaskDto);

    return await this.taskRepo.save(task);
  }

  async adminDeleteTask(id: number) {
    // First, find the task to ensure it exists
    const task = await this.taskRepo.findOne({
      where: { id }
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Delete the task
    await this.taskRepo.remove(task);

    return { success: true };
  }

  async getAllTasksByUserId(userId: number) {
    const tasks = await this.taskRepo.find({
      where: {
        user: { id: userId }
      },
      relations: ['user'],
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        dueDate: true,
        user: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      }
    });

    return tasks;
  }
   async addCommentToTask(taskId: number, content: string, userInfo: { userId: number; email?: string; role?: string }) {
    // Find the task
    const task = await this.taskRepo.findOne({ 
      where: { id: taskId },
      relations: ['user']
    });
    
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if the user has permission to comment on this task
    // Users can comment on their own tasks or admins can comment on any task
    if (task.user.id !== userInfo.userId && userInfo.role !== 'admin') {
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
      relations: ['user']
    });
    
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if the user has permission to view comments on this task
    // Users can view comments on their own tasks or admins can view comments on any task
    if (task.user.id !== userInfo.userId && userInfo.role !== 'admin') {
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
  
  async updateComment(taskId: number, commentId: number, updateCommentDto: UpdateCommentDto, userInfo: { userId: number; email?: string; role?: string }) {
    // First, find the task to make sure it exists
    const task = await this.taskRepo.findOne({ 
      where: { id: taskId }
    });
    
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Find the comment making sure it belongs to the specified task
    const comment = await this.commentRepo.findOne({
      where: { 
        id: commentId,
        task: { id: taskId }
      },
      relations: ['user']
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if the user has permission to update this comment
    // Only the comment author can update their own comment
    if (comment.user.id !== userInfo.userId) {
      throw new ForbiddenException('Permission denied to update this comment');
    }

    // Update the comment
    comment.content = updateCommentDto.content;
    
    const updatedComment = await this.commentRepo.save(comment);
    
    // Format the response
    return {
      id: updatedComment.id,
      content: updatedComment.content,
      createdAt: updatedComment.createdAt.toISOString(),
      user: {
        userId: comment.user.id,
        email: comment.user.email,
        name: comment.user.name,
        role: comment.user.role
      }
    };
  }
}