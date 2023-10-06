import { CodeDto } from '../dto/CodeDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { IdType } from '../../../models/IdType';
import { isError, RESPONSE_ERROR } from '../../../models/RESPONSE_ERROR';

export class ConfirmByEmailCommand {
  constructor(public codeDto: CodeDto) {}
}
@CommandHandler(ConfirmByEmailCommand)
export class ConfirmByEmailUseCase
  implements ICommandHandler<ConfirmByEmailCommand>
{
  constructor(private usersRepository: UsersRepository) {}
  async execute(command: ConfirmByEmailCommand) {
    const emailConfirmationData =
      await this.usersRepository.findEmailConfirmDataByCode(
        command.codeDto.code,
      );
    if (isError(emailConfirmationData)) return emailConfirmationData;
    if (
      emailConfirmationData.expDate > new Date() &&
      !emailConfirmationData.isConfirmed
    ) {
      return this.usersRepository.emailConfirmed(emailConfirmationData.userId);
    } else {
      return RESPONSE_ERROR.BAD_REQUEST;
    }
  }
}
