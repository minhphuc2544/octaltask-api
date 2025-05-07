import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator'

export class CreateTaskDto {
    @IsString()
    title: string

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
        console.log('CreateTaskDto instantiated!');
    }
}