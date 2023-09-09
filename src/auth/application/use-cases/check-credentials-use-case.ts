import { LoginDto } from '../dto/loginDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { IdType } from '../../../models/IdType';
import { BcryptAdapter } from '../../../users/infrastructure/adapters/bcryptAdapter';

export class CheckCredentialsCommand {
  constructor(public loginDto: LoginDto) {}
}
@CommandHandler(CheckCredentialsCommand)
export class CheckCredentialsUseCase
  implements ICommandHandler<CheckCredentialsCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private bcryptAdapter: BcryptAdapter,
  ) {}
  async execute(command: CheckCredentialsCommand) {
    const userData: {
      userId: IdType;
      hashPassword: string;
      isBanned: boolean;
    } | null = await this.usersRepository.findUserDataCheckCredentials(
      command.loginDto.loginOrEmail,
    );
    if (!userData || userData.isBanned) return null;

    const passwordIsValid = await this.bcryptAdapter.compare(
      command.loginDto.password,
      userData.hashPassword,
    );
    if (!passwordIsValid) return null;

    return userData.userId;
  }
}
