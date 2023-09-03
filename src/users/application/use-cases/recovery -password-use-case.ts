import { EmailDto } from '../dto/EmailDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { EmailManagers } from '../../../auth/application/managers/email.managers';
import { IdType } from '../../../models/IdType';
import { BcryptAdapter } from '../../infrastructure/adapters/bcryptAdapter';

export class RecoveryPasswordCommand {
  constructor(public emailDto: EmailDto) {}
}
@CommandHandler(RecoveryPasswordCommand)
export class RecoveryPasswordUseCase
  implements ICommandHandler<RecoveryPasswordCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailManager: EmailManagers,
    private bcryptAdapter: BcryptAdapter,
  ) {}
  async execute(command: RecoveryPasswordCommand) {
    const userId = await this.usersRepository.findUserByEmailOrLogin(
      command.emailDto.email,
    );
    if (!userId) return;
    const recoveryPas = await this._createPasswordRecovery(
      userId,
      command.emailDto.email,
    );
    try {
      await this.emailManager.passwordRecovery(
        command.emailDto.email,
        recoveryPas,
      );
    } catch {
      return;
    }
  }
  private async _createPasswordRecovery(userId: IdType, email: string) {
    const recoveryCode = await this.bcryptAdapter.uuid();
    const expirationDate = await this.bcryptAdapter.addMinutes(60);
    const pasRecovery = {
      userId,
      email,
      recoveryCode,
      expirationDate,
    };
    await this.usersRepository.createRecovery(pasRecovery);
  }
}
