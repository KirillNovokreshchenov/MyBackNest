import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CodeDto {
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  code: string;
}
