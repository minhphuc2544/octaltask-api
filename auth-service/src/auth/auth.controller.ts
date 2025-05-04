import { Body,Controller, Post, Request, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import { JwtGuard } from './guards/jwt.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'Login')
  async login(data: { email: string; password: string }) {
   
    const user = await this.authService.validateUser(data.email, data.password);
    if (!user) {
      throw new RpcException('Invalid credentials');
    }
    console.log('GRPC login called with', this.authService.login(user));
    return await this.authService.login(user);
  }
  
  @GrpcMethod('AuthService', 'Signup')
  async signup(data: { email: string; password: string; name: string }) {
    return this.authService.signup(data.email, data.password, data.name);
  }
  
  @GrpcMethod('AuthService', 'RequestPasswordReset')
  async requestPasswordReset(data: { email: string }) {
    return this.authService.requestPasswordReset(data.email);
  }

  @GrpcMethod('AuthService', 'ResetPassword')
  async resetPassword(data: { token: string; newPassword: string }) {
    return this.authService.resetPassword(data.token, data.newPassword);
  }
}
