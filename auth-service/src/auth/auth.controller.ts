import { Body,Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    // req.user được LocalStrategy inject vào sau khi xác thực
    return this.authService.login(req.user); // trả JWT token về
  }
  @Post('signup')
  async signup(
    @Body() body: { email: string; password: string; name: string }
  ) {
    return this.authService.signup(body.email, body.password, body.name);
  }
}
