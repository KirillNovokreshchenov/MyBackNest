import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';

export class BanDto {
  @IsBoolean()
  isBanned: boolean;
  @MinLength(20)
  @IsString()
  banReason: string;
}
