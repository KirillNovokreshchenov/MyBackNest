import { EmailDto } from '../dto/EmailDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { EmailManagers } from '../../../auth/application/managers/email.managers';
import { IdType } from '../../../models/IdType';
import { BcryptAdapter } from '../../infrastructure/adapters/bcryptAdapter';

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
    const confirmData: { userId: IdType; isConfirmed: boolean } | null =
      await this.usersRepository.findDataConfirmedByEmail(
        command.emailDto.email,
      );
    if (!confirmData || confirmData.isConfirmed) return false;
    const confirmCode = await this._createEmailConfirmation(confirmData.userId);
    try {
      await this.emailManager.emailRegistration(
        command.emailDto.email,
        confirmCode,
      );
    } catch {
      return false;
    }
    return true;
  }
  async _createEmailConfirmation(userId: IdType) {
    const confirmationCode = this.bcryptAdapter.uuid();
    const expirationDate = this.bcryptAdapter.addMinutes(60);
    const emailConfirmation = {
      confirmationCode,
      expirationDate,
      isConfirmed: false,
    };
    const isCreated = await this.usersRepository.createEmailConfirmation(
      userId,
      emailConfirmation,
    );
    if (isCreated === null) return null;
    return confirmationCode;
  }
}
