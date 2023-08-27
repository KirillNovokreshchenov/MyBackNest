import { CodeDto } from '../dto/CodeDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';

export class ConfirmByEmailCommand {
  constructor(public codeDto: CodeDto) {}
}
@CommandHandler(ConfirmByEmailCommand)
export class ConfirmByEmailUseCase
  implements ICommandHandler<ConfirmByEmailCommand>
{
  constructor(private usersRepository: UsersRepository) {}
  async execute(command: ConfirmByEmailCommand) {
    const user = await this.usersRepository.findUserByCode(
      command.codeDto.code,
    );
    if (!user) return false;
    if (user.canBeConfirmed()) {
      user.emailConfirmation.isConfirmed = true;
      await this.usersRepository.saveUser(user);
      return true;
    } else {
      return false;
    }
  }
}
