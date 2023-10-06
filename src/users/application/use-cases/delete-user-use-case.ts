import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { IdType } from '../../../models/IdType';
import { isError } from '../../../models/RESPONSE_ERROR';

export class DeleteUserCommand {
  constructor(public userId: IdType) {}
}
@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private usersRepository: UsersRepository) {}
  async execute(command: DeleteUserCommand) {
    const userIsExists = await this.usersRepository.findUserId(command.userId);
    if (isError(userIsExists)) return userIsExists;
    return this.usersRepository.deleteUser(command.userId);
  }
}
