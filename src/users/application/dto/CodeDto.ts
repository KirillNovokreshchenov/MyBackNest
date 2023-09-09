import { IsNotEmpty, IsString } from 'class-validator';

export class CodeDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
