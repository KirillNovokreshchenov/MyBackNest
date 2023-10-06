import { EmailDto } from '../dto/EmailDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { EmailManagers } from '../../../auth/application/managers/email.managers';
import { IdType } from '../../../models/IdType';
import { BcryptAdapter } from '../../infrastructure/adapters/bcryptAdapter';
import { isError, RESPONSE_ERROR } from '../../../models/RESPONSE_ERROR';

export class EmailResendingCommand {
  constructor(public emailDto: EmailDto) {}
}
@CommandHandler(EmailResendingCommand)
export class EmailResendingUseCase
  implements ICommandHandler<EmailResendingCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailManager: EmailManagers,
    private bcryptAdapter: BcryptAdapter,
  ) {}
  async execute(command: EmailResendingCommand) {
    const confirmData = await this.usersRepository.findDataConfirmedByEmail(
      command.emailDto.email,
    );
    if (isError(confirmData) || confirmData.isConfirmed)
      return RESPONSE_ERROR.BAD_REQUEST;
    const confirmationCode = this.bcryptAdapter.uuid();
    try {
      await this.emailManager.emailRegistration(
        command.emailDto.email,
        confirmationCode,
      );
    } catch {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
    return this._createEmailConfirmation(confirmData.userId, confirmationCode);
  }
  async _createEmailConfirmation(userId: IdType, confirmationCode: string) {
    const expirationDate = this.bcryptAdapter.addMinutes(60);
    const emailConfirmation = {
      confirmationCode,
      expirationDate,
      isConfirmed: false,
    };
    return this.usersRepository.createEmailConfirmation(
      userId,
      emailConfirmation,
    );
  }
}
