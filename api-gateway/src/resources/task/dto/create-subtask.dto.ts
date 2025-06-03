import { IsBoolean, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateSubtaskDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  content: string;

  @IsNotEmpty()
  @IsBoolean()
  isCompleted: boolean;
}