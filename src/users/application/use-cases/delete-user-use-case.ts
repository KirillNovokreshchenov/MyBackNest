import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../infrastructure/users.repository";
import { IdType } from "../../../models/IdType";

export class DeleteUserCommand {
  constructor(public id: IdType) {}
}
@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private usersRepository: UsersRepository) {}
  async execute(command: DeleteUserCommand) {
    const isDeleted = await this.usersRepository.deleteUser(command.id);
    return isDeleted;
  }
}
