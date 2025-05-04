import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'Login')
  async login(data: { email: string; password: string }) {
    try {
      const user = await this.authService.validateUser(data.email, data.password);
      return await this.authService.login(user);
    } catch (error) {
      throw new RpcException(error.message || 'Login failed');
    }
  }

  @GrpcMethod('AuthService', 'Signup')
  async signup(data: { email: string; password: string; name: string }) {
    try {
      // Password validation
      if (data.password.length < 8) {
        throw new RpcException('Password must be at least 8 characters long');
      }
      
      const result = await this.authService.signup(data.email, data.password, data.name);
      return { message: 'User created successfully', user: result };
    } catch (error) {
      throw new RpcException(error.message || 'Signup failed');
    }
  }

  @GrpcMethod('AuthService', 'RequestPasswordReset')
  async requestPasswordReset(data: { email: string }) {
    try {
      return await this.authService.requestPasswordReset(data.email);
    } catch (error) {
      throw new RpcException(error.message || 'Password reset request failed');
    }
  }

  @GrpcMethod('AuthService', 'ResetPassword')
  async resetPassword(data: { token: string; newPassword: string }) {
    try {
      // Password validation
      if (data.newPassword.length < 8) {
        throw new RpcException('Password must be at least 8 characters long');
      }
      
      return await this.authService.resetPassword(data.token, data.newPassword);
    } catch (error) {
      throw new RpcException(error.message || 'Password reset failed');
    }
  }
}