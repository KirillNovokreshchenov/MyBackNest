import { IsString, Length, Matches, Validate } from 'class-validator';
import { EmailExistsRule } from '../../validators/custom-email-exists.validator';
import { LoginExistsRule } from '../../validators/custom-login-exists.validator';

export class CreateUserDto {
  @Validate(LoginExistsRule)
  @Length(3, 10)
  @IsString()
  login: string;
  @Length(6, 20)
  @IsString()
  password: string;
  @Validate(EmailExistsRule)
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, { message: 'email incorrect' })
  @IsString()
  email: string;
}
