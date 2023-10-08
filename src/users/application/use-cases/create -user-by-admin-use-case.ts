import { CreateUserDto } from '../dto/CreateUserDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User, UserModelType } from '../../domain/user.schema';
import { UsersRepository } from '../../infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { BcryptAdapter } from '../../infrastructure/adapters/bcryptAdapter';
import { IdType } from '../../../models/IdType';

export class CreateUserByAdminCommand {
  constructor(public userDto: CreateUserDto) {}
}
@CommandHandler(CreateUserByAdminCommand)
export class CreateUserByAdminUseCase
  implements ICommandHandler<CreateUserByAdminCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private bcryptAdapter: BcryptAdapter,
  ) {}
  async execute(command: CreateUserByAdminCommand): Promise<IdType> {
    const { login, email, password } = command.userDto;
    const passwordHash = await this.bcryptAdapter.hashPassword(password);
    const userId: IdType = await this.usersRepository.createUser({
      login,
      email,
      passwordHash,
    });
    return userId;
  }
}
