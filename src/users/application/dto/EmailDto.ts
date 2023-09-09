import { IsString, Matches } from 'class-validator';

export class EmailDto {
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, { message: 'email incorrect' })
  @IsString()
  email: string;
}
