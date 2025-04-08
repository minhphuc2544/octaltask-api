import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'YuilRin*123',
    database: 'octaltask',
    entities: [User],
    synchronize: true, // true khi dev
  }),
  TypeOrmModule.forFeature([User]),
  UsersModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


