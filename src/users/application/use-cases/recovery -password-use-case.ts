import { EmailDto } from '../dto/EmailDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  PasswordRecovery,
  PasswordRecoveryType,
} from '../../../auth/domain/password-recovery.schema';
import { UsersRepository } from '../../infrastructure/users.repository';
import { EmailManagers } from '../../../auth/application/managers/email.managers';

export class RecoveryPasswordCommand {
  constructor(public emailDto: EmailDto) {}
}
@CommandHandler(RecoveryPasswordCommand)
export class RecoveryPasswordUseCase
  implements ICommandHandler<RecoveryPasswordCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    protected emailManager: EmailManagers,
    @InjectModel(PasswordRecovery.name)
    private passwordRecoveryModel: PasswordRecoveryType,
  ) {}
  async execute(command: RecoveryPasswordCommand) {
    const user = await this.usersRepository.findUserByEmailOrLogin(
      command.emailDto.email,
    );
    if (!user) return;
    const pasRecovery = await this.passwordRecoveryModel.createRecovery(
      this.passwordRecoveryModel,
      command.emailDto.email,
    );

    try {
      await this.emailManager.passwordRecovery(
        command.emailDto.email,
        pasRecovery.recoveryCode,
      );
    } catch {
      return;
    }
    await this.usersRepository.saveRecovery(pasRecovery);
  }
}
