import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class UpdatePostDto {
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
  @IsNotEmpty()
  @IsString()
  blogId: string;
}
