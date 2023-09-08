import { IsNotEmpty, IsString, MaxLength, Validate } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";
import { BlogExistsRule } from "../../validators/custom-blogId.validator";

export class CreatePostDto {
  @MaxLength(30)
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsNotEmpty()
  @IsString()
  title: string;
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsNotEmpty()
  @IsString()
  shortDescription: string;
  @MaxLength(1000)
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsNotEmpty()
  @IsString()
  content: string;
  @Validate(BlogExistsRule)
  @IsNotEmpty()
  @IsString()
  blogId: string;
}
