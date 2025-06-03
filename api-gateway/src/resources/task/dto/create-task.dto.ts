import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateTaskDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    isCompleted?: boolean;

    @IsBoolean()
    @IsOptional()
    isStarted?: boolean;

    @IsOptional()
    @IsString()
    dueDate?: string;

    @IsOptional()
    @IsNumber()
    listId?: number;
}