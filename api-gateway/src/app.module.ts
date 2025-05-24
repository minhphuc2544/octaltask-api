import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { TaskModule } from './task/task.module';
import { CommentModule } from './comment/comment.module';
import { SubtaskModule } from './subtask/subtask.module';
import { ListController } from './list/list.controller';
import { ListModule } from './list/list.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '..', '.env'),
    }),
    AuthModule,
    TaskModule,
    CommentModule,
    SubtaskModule,
    ListModule
  ],
  controllers: [AppController, AuthController, ListController],
  providers: [AppService],
})
export class AppModule { }
