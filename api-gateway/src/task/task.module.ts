import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getTaskGrpcClientOptions } from 'src/client-options/task.grpc-client';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'TASK_PACKAGE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: getTaskGrpcClientOptions,
      },
    ]),
  ],
  providers: [TaskService, JwtStrategy],
  controllers: [TaskController],
  exports: [TaskService],
})
export class TaskModule {}
