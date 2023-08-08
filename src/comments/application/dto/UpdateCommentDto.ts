import { IsString, Length } from 'class-validator';

export class UpdateCommentDto {
  @Length(20, 300)
  @IsString()
  content: string;
}
