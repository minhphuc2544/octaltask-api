import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task } from 'src/entities/task.entity';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule} from '@nestjs/config';
import { Comment } from '../../entities/comment.entity';
import { Subtask } from '../../entities/subtask.entity';
import { List } from 'src/entities/list.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule,
    
    
    ClientsModule.register([
      {
        name: 'USER_INFO_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'userinfo',
          protoPath: join(__dirname, '../../proto/userinfo.proto'),
          url: 'localhost:50054', // User service gRPC endpoint
        },
      },
    ]),
    
    TypeOrmModule.forFeature([Task]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Comment]),
    TypeOrmModule.forFeature([Subtask]),
    TypeOrmModule.forFeature([List])
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
