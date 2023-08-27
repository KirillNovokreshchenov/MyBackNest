import { CreateUserDto } from '../dto/CreateUserDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User, UserDocument, UserModelType } from '../../domain/user.schema';
import { UsersRepository } from '../../infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';

export class CreateUserByAdminCommand {
  constructor(public userDto: CreateUserDto) {}
}
@CommandHandler(CreateUserByAdminCommand)
export class CreateUserByAdminUseCase
  implements ICommandHandler<CreateUserByAdminCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {}
  async execute(command: CreateUserByAdminCommand) {
    const newUser: UserDocument = await this.UserModel.createNewUser(
      command.userDto,
      this.UserModel,
    );

    await this.usersRepository.saveUser(newUser);
    return newUser._id;
  }
}
