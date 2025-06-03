import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

type ListType = 'personal' | 'work' | 'home' | 'study' | 'default';
type ListColor = 'blue' | 'green' | 'red' | 'purple' | 'amber';

export class CreateListDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    icon: ListType;

    @IsString()
    @IsOptional()
    color: ListColor;

    @IsOptional()
    @IsString()
    dueDate?: string;
}