import { CreateUserDto } from '../dto/CreateUserDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User, UserDocument, UserModelType } from '../../domain/user.schema';
import { UsersRepository } from '../../infrastructure/users.repository';
import { EmailManagers } from '../../../auth/application/managers/email.managers';
import { InjectModel } from '@nestjs/mongoose';

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
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {}
  async execute(command: CreateUserByRegistrationCommand) {
    const newUser: UserDocument = await this.UserModel.createNewUser(
      command.userDto,
      this.UserModel,
    );
    newUser.createEmailConfirm();
    try {
      await this.emailManager.emailRegistration(newUser);
    } catch {
      return false;
    }
    await this.usersRepository.saveUser(newUser);
    return true;
  }
}
