import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('UserService', 'FindOneByEmail')
  findOneByEmail(data: { email: string }) {
    return this.appService.findOneByEmail(data.email);
  }

  @GrpcMethod('UserService', 'CreateUser')
  createUser(data: { email: string; password: string }) {
    return this.appService.createUser(data.email, data.password);
  }

  @GrpcMethod('UserService', 'ValidatePassword')
  validatePassword(data: { email: string; password: string }) {
    return this.appService.validatePassword(data.email, data.password);
  }
  
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
