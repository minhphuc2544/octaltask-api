import { IsString, IsOptional, IsBoolean, IsDate } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsDate()
  @IsOptional()
  dueDate?: Date;
}