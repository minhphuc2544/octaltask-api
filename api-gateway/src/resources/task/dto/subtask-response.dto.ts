export class UserInfoDto {
  id: number;

  email: string;

  name: string;

  role: string;
}

export class SubtaskResponseDto {
  taskId: number;

  subtaskId: number;

  content: string;

  isCompleted: boolean;

  createdAt: string;

  user: UserInfoDto;
}

export class SubtaskListResponseDto {
  Subtasks: SubtaskResponseDto[];
}