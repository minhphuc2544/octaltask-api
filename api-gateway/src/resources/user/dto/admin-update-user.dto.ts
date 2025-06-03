import { IsOptional, IsString } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

export class AdminUpdateUserDto extends UpdateUserDto {
  @IsOptional()
  @IsString()
  role?: string;
}