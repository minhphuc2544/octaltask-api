import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { ClientsModule } from '@nestjs/microservices';
import { grpcClientOptions } from 'src/client-options/task.grpc-client';

@Module({
  imports: [
      ClientsModule.register([grpcClientOptions]),
    ],
  providers: [TaskService],
  controllers: [TaskController],
  exports: [TaskService],
})
export class TaskModule {}
