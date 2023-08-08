import { IsString, Length } from 'class-validator';

export class CreateCommentDto {
  @Length(20, 300)
  @IsString()
  content: string;
}
