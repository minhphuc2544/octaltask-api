import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Patch,
    UseGuards,
    Request,
    HttpException,
    HttpStatus,
    Logger
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { of } from 'rxjs';
import { JwtGuard } from './guards/jwt.guard';
import { AdminGuard } from './guards/admin.guard';

interface TaskServiceClient {
    createTask(data: any): any;
    getAllTasks(data: any): any;
    getTaskById(data: any): any;
    updateTask(data: any): any;
    deleteTask(data: any): any;
    getAllTasksForAdmin(data: any): any;
    adminDeleteTask(data: any): any;
    adminUpdateTask(data: any): any;
    getTaskByIdForAdmin(data: any): any;
    getAllTasksByUserId(data: any): any;
}

@Controller('tasks')
export class TaskController {
    private taskService: TaskServiceClient;
    private readonly logger = new Logger(TaskController.name);
    private readonly TIMEOUT_MS = 5000; // 5 seconds timeout for gRPC calls

    constructor(@Inject('TASK_PACKAGE') private client: ClientGrpc) { }

    onModuleInit() {
        this.taskService = this.client.getService<TaskServiceClient>('TaskService');
    }

    // Helper method to handle gRPC call errors
    private async handleGrpcCall<T>(methodName: string, call: any, errorMessage: string): Promise<T> {
        try {
            this.logger.debug(`Making gRPC call: ${methodName}`);
            return await firstValueFrom(
                call.pipe(
                    timeout(this.TIMEOUT_MS),
                    catchError(error => {
                        this.logger.error(`gRPC ${methodName} error:`, error);

                        // Map gRPC error codes to HTTP status codes
                        let status = HttpStatus.INTERNAL_SERVER_ERROR;
                        let message = errorMessage;

                        if (error.code) {
                            switch (error.code) {
                                case 5: // NOT_FOUND
                                    status = HttpStatus.NOT_FOUND;
                                    message = error.details || 'Resource not found';
                                    break;
                                case 7: // PERMISSION_DENIED
                                    status = HttpStatus.FORBIDDEN;
                                    message = error.details || 'Permission denied';
                                    break;
                                case 3: // INVALID_ARGUMENT
                                    status = HttpStatus.BAD_REQUEST;
                                    message = error.details || 'Invalid arguments';
                                    break;
                                case 16: // UNAUTHENTICATED
                                    status = HttpStatus.UNAUTHORIZED;
                                    message = error.details || 'Not authenticated';
                                    break;
                            }
                        }

                        throw new HttpException(
                            {
                                status,
                                error: message,
                                details: error.details || {},
                            },
                            status
                        );
                    })
                )
            );
        } catch (error) {
            // If it's already an HttpException, rethrow it
            if (error instanceof HttpException) {
                throw error;
            }

            // Otherwise, create a new one with a generic message
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: errorMessage,
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post()
    @UseGuards(JwtGuard)
    async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
        const user = {
            userId: req.user.id,
            email: req.user.email,
            role: req.user.role
        };

        return this.handleGrpcCall(
            'createTask',
            this.taskService.createTask({ ...createTaskDto, user }),
            'Failed to create task'
        );
    }

    @Get()
    @UseGuards(JwtGuard)
    async findAll(@Request() req) {
        const user = {
            userId: req.user.id,
            email: req.user.email,
            role: req.user.role
        };

        return this.handleGrpcCall(
            'getAllTasks',
            this.taskService.getAllTasks({}),
            'Failed to retrieve tasks'
        );
    }

    @Get(':id')
    @UseGuards(JwtGuard)
    async findOne(@Param('id') id: string, @Request() req) {
        const user = {
            userId: req.user.id,
            email: req.user.email,
            role: req.user.role
        };

        return this.handleGrpcCall(
            'getTaskById',
            this.taskService.getTaskById({ id: parseInt(id, 10) }),
            `Failed to retrieve task with id ${id}`
        );
    }

    @Patch(':id')
    @UseGuards(JwtGuard)
    async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req) {
        const user = {
            userId: req.user.id,
            email: req.user.email,
            role: req.user.role
        };

        return this.handleGrpcCall(
            'updateTask',
            this.taskService.updateTask({
                id: parseInt(id, 10),
                ...updateTaskDto,
                user
            }),
            `Failed to update task with id ${id}`
        );
    }

    @Delete(':id')
    @UseGuards(JwtGuard)
    async remove(@Param('id') id: string, @Request() req) {
        const user = {
            userId: req.user.id,
            email: req.user.email,
            role: req.user.role
        };

        return this.handleGrpcCall(
            'deleteTask',
            this.taskService.deleteTask({ id: parseInt(id, 10) }),
            `Failed to delete task with id ${id}`
        );
    }

    // Admin routes with role guards
    @Get('admin/all')
    @UseGuards(JwtGuard, AdminGuard)
    async getAllTasksForAdmin(@Request() req) {
        const user = {
            userId: req.user.id,
            email: req.user.email,
            role: req.user.role
        };

        return this.handleGrpcCall(
            'getAllTasksForAdmin',
            this.taskService.getAllTasksForAdmin({}),
            'Failed to retrieve all tasks'
        );
    }

    @Delete('admin/:id')
    @UseGuards(JwtGuard, AdminGuard)

    async adminDeleteTask(@Param('id') id: string, @Request() req) {
        const user = {
            userId: req.user.id,
            email: req.user.email,
            role: req.user.role
        };

        return this.handleGrpcCall(
            'adminDeleteTask',
            this.taskService.adminDeleteTask({ id: parseInt(id, 10) }),
            `Failed to delete task with id ${id}`
        );
    }

    @Patch('admin/:id')
    @UseGuards(JwtGuard, AdminGuard)

    async adminUpdateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req) {
        const user = {
            userId: req.user.id,
            email: req.user.email,
            role: req.user.role
        };

        return this.handleGrpcCall(
            'adminUpdateTask',
            this.taskService.adminUpdateTask({
                id: parseInt(id, 10),
                ...updateTaskDto,
                user
            }),
            `Failed to update task with id ${id}`
        );
    }

    @Get('admin/:id')
    @UseGuards(JwtGuard, AdminGuard)

    async adminGetTaskById(@Param('id') id: string, @Request() req) {
        const user = {
            userId: req.user.id,
            email: req.user.email,
            role: req.user.role
        };

        return this.handleGrpcCall(
            'getTaskByIdForAdmin',
            this.taskService.getTaskByIdForAdmin({ id: parseInt(id, 10) }),
            `Failed to retrieve task with id ${id}`
        );
    }

    @Get('admin/user/:userId')
    @UseGuards(JwtGuard, AdminGuard)
    async getAllTasksByUserId(@Param('userId') userId: string, @Request() req) {
        const user = {
            userId: req.user.id,
            email: req.user.email,
            role: req.user.role
        };

        return this.handleGrpcCall(
            'getAllTasksByUserId',
            this.taskService.getAllTasksByUserId({ userId: parseInt(userId, 10) }),
            `Failed to retrieve tasks for user ${userId}`
        );
    }
}