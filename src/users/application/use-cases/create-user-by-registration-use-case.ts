import { CreateUserDto } from '../dto/CreateUserDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { EmailManagers } from '../../../auth/application/managers/email.managers';
import { IdType } from '../../../models/IdType';
import { BcryptAdapter } from '../../infrastructure/adapters/bcryptAdapter';

export class CreateUserByRegistrationCommand {
  constructor(public userDto: CreateUserDto) {}
}
@CommandHandler(CreateUserByRegistrationCommand)
export class CreateUserByRegistrationUseCase
  implements ICommandHandler<CreateUserByRegistrationCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailManager: EmailManagers,
    private bcryptAdapter: BcryptAdapter,
  ) {}
  async execute(command: CreateUserByRegistrationCommand) {
    const userId: IdType = await this.createUser(command);
    const confirmationCode = this.bcryptAdapter.uuid();
    try {
      await this.emailManager.emailRegistration(
        command.userDto.email,
        confirmationCode,
      );
    } catch {
      return false;
    }
    const createEmailConfirm = await this._createEmailConfirmation(
      userId,
      confirmationCode,
    );
    if (createEmailConfirm === null) return false;
    return true;
  }
  async createUser(command: CreateUserByRegistrationCommand) {
    const { login, email, password } = command.userDto;
    const passwordHash = await this.bcryptAdapter.hashPassword(password);
    const userId: IdType = await this.usersRepository.createUser({
      login,
      email,
      passwordHash,
    });
    return userId;
  }
  async _createEmailConfirmation(userId: IdType, confirmationCode: string) {
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
  }
}
