
import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator'

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    title?: string

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsBoolean()
    isCompleted?: boolean

    @IsOptional()
    @IsDateString()
    dueDate?: string

    constructor() {
        console.log('UpdateTaskDto instantiated!');
    }
}