import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @MaxLength(30)
  @IsNotEmpty()
  @IsString()
  title: string;
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  shortDescription: string;
  @MaxLength(1000)
  @IsNotEmpty()
  @IsString()
  content: string;
  @IsNotEmpty()
  @IsString()
  blogId: string;
}
