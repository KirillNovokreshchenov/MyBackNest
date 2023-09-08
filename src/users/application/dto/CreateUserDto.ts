import { IsString, Length, Matches } from "class-validator";

export class CreateUserDto {
  @Length(3, 10)
  @IsString()
  login: string;
  @Length(6, 20)
  @IsString()
  password: string;
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, { message: 'email incorrect' })
  @IsString()
  email: string;
}
