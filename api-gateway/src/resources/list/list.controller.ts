import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus, ValidationPipe, Query } from '@nestjs/common';
import { ListService } from './list.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { ShareListDto } from './dto/share-list.dto';
import { UpdateSharedRoleDto } from './dto/update-shared-role.dto';
import { JwtGuard } from '../../guards/jwt.guard';

@Controller('lists')
export class ListController {
  constructor(private readonly listService: ListService) { }

  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createListDto: CreateListDto, @Request() req) {
    const something = await this.listService.create(createListDto, req.user);
    return something;
  }

  @Get()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async findAll(@Request() req) {
    return this.listService.findAll(req.user);
  }

  @Get('shared')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async getSharedLists(@Request() req) {
    return this.listService.getSharedLists(req.user);
  }

  @Get('users/search')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async searchUsers(@Query('email') email: string) {
    return this.listService.getUsersByEmail(email);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string, @Request() req) {
    return this.listService.findOne(parseInt(id, 10), req.user);
  }

  @Get(':id/shared-users')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async getListSharedUsers(@Param('id') id: string, @Request() req) {
    return this.listService.getListSharedUsers(parseInt(id, 10), req.user);
  }

  @Post(':id/share')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async shareList(
    @Param('id') id: string,
    @Body(ValidationPipe) shareListDto: ShareListDto,
    @Request() req
  ) {
    return this.listService.shareList(parseInt(id, 10), shareListDto.email, shareListDto.role, req.user);
  }

  @Patch(':id/shared-users/:userId/role')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async updateSharedRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body(ValidationPipe) updateSharedRoleDto: UpdateSharedRoleDto,
    @Request() req
  ) {
    return this.listService.updateSharedRole(
      parseInt(id, 10),
      parseInt(userId, 10),
      updateSharedRoleDto.role,
      req.user
    );
  }

  @Delete(':id/shared-users/:userId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async removeSharedUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req
  ) {
    return this.listService.removeSharedUser(parseInt(id, 10), parseInt(userId, 10), req.user);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateListDto: UpdateListDto,
    @Request() req
  ) {
    return this.listService.update(parseInt(id, 10), updateListDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Request() req) {
    return this.listService.remove(parseInt(id, 10), req.user);
  }
}