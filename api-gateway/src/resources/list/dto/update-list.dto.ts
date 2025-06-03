import { IsOptional, IsString } from 'class-validator';

type ListType = 'personal' | 'work' | 'home' | 'study' | 'default';
type ListColor = 'blue' | 'green' | 'red' | 'purple' | 'amber';

export class UpdateListDto {
    @IsString()
    @IsOptional()
    name?: string;

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