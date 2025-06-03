import { Controller, Get, Patch, Put, Delete, Body, Param, Request, UseGuards, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../../guards/jwt.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // User endpoints (authenticated users)
  @Get('me')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Request() req) {
    return this.userService.getCurrentUser(req.user);
  }

  @Patch('me')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async updateCurrentUser(
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    return this.userService.updateCurrentUser(updateUserDto, req.user);
  }

  @Put('me/password')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
    @Request() req
  ) {
    return this.userService.changePassword(changePasswordDto, req.user);
  }

  @Delete('me')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async deleteCurrentUser(@Request() req) {
    return this.userService.deleteCurrentUser(req.user);
  }

  // Admin endpoints
  @Get()
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(parseInt(id, 10));
  }

  @Patch(':id')
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async updateUserById(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: AdminUpdateUserDto
  ) {
    return this.userService.updateUserById(parseInt(id, 10), updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async deleteUserById(@Param('id') id: string) {
    return this.userService.deleteUserById(parseInt(id, 10));
  }
}