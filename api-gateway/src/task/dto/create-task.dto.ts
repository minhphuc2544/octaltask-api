import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsDate } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date;
}