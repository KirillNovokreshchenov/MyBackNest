import { LoginDto } from '../dto/loginDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class CheckCredentialsCommand {
  constructor(public loginDto: LoginDto) {}
}
@CommandHandler(CheckCredentialsCommand)
export class CheckCredentialsUseCase
  implements ICommandHandler<CheckCredentialsCommand>
{
  constructor(private usersRepository: UsersRepository) {}
  async execute(command: CheckCredentialsCommand) {
    const user = await this.usersRepository.findUserByEmailOrLogin(
      command.loginDto.loginOrEmail,
    );
    if (!user || user.banInfo.isBanned) return null;
    const passwordIsValid = await user.passwordIsValid(
      command.loginDto.password,
      user.password,
    );
    if (!passwordIsValid) return null;
    return user._id;
  }
}
