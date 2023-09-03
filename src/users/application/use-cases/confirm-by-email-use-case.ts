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
    const emailConfirmationData = await this.usersRepository.findUserByCode(
      command.codeDto.code,
    );
    if (!emailConfirmationData) return false;
    if (
      emailConfirmationData.expDate > new Date() &&
      !emailConfirmationData.isConfirmed
    ) {
      const isConfirmed = await this.usersRepository.emailConfirmed(
        emailConfirmationData.userId,
      );
      if (!isConfirmed === null) return false;
      return true;
    } else {
      return false;
    }
  }
}
