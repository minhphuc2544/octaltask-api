
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  Login(@Body() body: { email: string; password: string }) {
    return this.authService.Login(body.email, body.password);
  }

  @Post('signup')
  Signup(@Body() body: { email: string; password: string; name: string }) {
    return this.authService.Signup(body.email, body.password, body.name);
  }

  @Post('forgot-password')
  Forgot(@Body('email') email: string) {
    return this.authService.RequestPasswordReset(email);
  }

  @Post('reset-password')
  Reset(@Body() body: { token: string; newPassword: string }) {
    return this.authService.ResetPassword(body.token, body.newPassword);
  }
}
