export class UserInfoDto {
  id: number;

  email: string;

  name: string;

  role: string;
}

export class CommentResponseDto {
  id: number;

  content: string;

  createdAt: string;

  user: UserInfoDto;
}

export class CommentListResponseDto {
  comments: CommentResponseDto[];
}