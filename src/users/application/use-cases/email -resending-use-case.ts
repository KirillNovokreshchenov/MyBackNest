import { EmailDto } from '../dto/EmailDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { EmailManagers } from '../../../auth/application/managers/email.managers';

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
  ) {}
  async execute(command: EmailResendingCommand) {
    const user = await this.usersRepository.findUserByEmailOrLogin(
      command.emailDto.email,
    );
    if (!user || user.emailConfirmation.isConfirmed) return false;
    user.createEmailConfirm();
    try {
      await this.emailManager.emailRegistration(user);
    } catch {
      return false;
    }
    await this.usersRepository.saveUser(user);
    return true;
  }
}
