import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateBlogDto {
  @MaxLength(15)
  @IsNotEmpty()
  @IsString()
  name: string;
  @MaxLength(500)
  @IsNotEmpty()
  @IsString()
  description: string;
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
    {
      message: 'Website Url incorrect',
    },
  )
  @MaxLength(30)
  @IsNotEmpty()
  @IsString()
  websiteUrl: string;
}
