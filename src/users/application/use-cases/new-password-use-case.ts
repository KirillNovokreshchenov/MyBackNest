import { NewPasswordDto } from "../../../auth/application/dto/NewPasswordDto";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../infrastructure/users.repository";
import { IdType } from "../../../models/IdType";
import { BcryptAdapter } from "../../infrastructure/adapters/bcryptAdapter";

export class NewPasswordCommand {
  constructor(public newPasswordDto: NewPasswordDto) {}
}
@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private bcryptAdapter: BcryptAdapter,
  ) {}
  async execute(command: NewPasswordCommand) {
    const recoveryData: {
      userId: IdType;
      recCode: string;
      expDate: Date;
    } | null = await this.usersRepository.findRecovery(
      command.newPasswordDto.recoveryCode,
    );
    if (!recoveryData) return false;
    if (
      recoveryData.recCode === command.newPasswordDto.recoveryCode &&
      recoveryData.expDate > new Date()
    ) {
      const newPass = await this.bcryptAdapter.hashPassword(
        command.newPasswordDto.newPassword,
      );
      const isCreated = await this.usersRepository.newPass(
        recoveryData.userId,
        newPass,
      );
      if (isCreated === null) return false;
      return true;
    } else {
      return false;
    }
  }
}
