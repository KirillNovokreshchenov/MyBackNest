import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

export class NewPasswordDto {
  @Length(6, 20)
  @IsString()
  newPassword: string;
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  recoveryCode: string;
}
