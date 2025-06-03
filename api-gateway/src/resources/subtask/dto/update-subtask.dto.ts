import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdateSubtaskDto {
  @IsString()
  @IsNotEmpty()
  content?: string;

  @IsBoolean()
  @IsNotEmpty()
  isCompleted?: boolean;

}
