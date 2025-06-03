import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtGuard } from 'src/guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body(ValidationPipe) body: SignupDto) {
    const something = await this.authService.signup(body.email, body.password, body.name);
    return something;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body(ValidationPipe) body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @Get('me')
  @UseGuards(JwtGuard) // Use your existing JwtGuard
  @HttpCode(HttpStatus.OK)
  async getMe(@Request() req: any) {
    // Your JwtGuard should populate req.user with user info including user ID
    const userId = req.user.sub || req.user.id; // Adjust based on your JWT payload structure
    return this.authService.getUserById(userId);
  }
}