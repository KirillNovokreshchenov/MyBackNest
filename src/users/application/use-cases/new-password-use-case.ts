import { NewPasswordDto } from '../../../auth/application/dto/NewPasswordDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';

export class NewPasswordCommand {
  constructor(public newPasswordDto: NewPasswordDto) {}
}
@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(private usersRepository: UsersRepository) {}
  async execute(command: NewPasswordCommand) {
    const pasRecovery = await this.usersRepository.findRecovery(
      command.newPasswordDto.recoveryCode,
    );
    if (!pasRecovery) return false;
    const user = await this.usersRepository.findUserByEmailOrLogin(
      pasRecovery.email,
    );
    if (!user) return false;
    if (pasRecovery.canBeRecovery(command.newPasswordDto.recoveryCode)) {
      await user.createHash(command.newPasswordDto.newPassword, user);
      await this.usersRepository.saveUser(user);
      return true;
    } else {
      return false;
    }
  }
}
