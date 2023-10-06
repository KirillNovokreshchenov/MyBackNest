import { NewPasswordDto } from '../../../auth/application/dto/NewPasswordDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { IdType } from '../../../models/IdType';
import { BcryptAdapter } from '../../infrastructure/adapters/bcryptAdapter';
import { isError, RESPONSE_ERROR } from '../../../models/RESPONSE_ERROR';

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
    const recoveryData = await this.usersRepository.findRecovery(
      command.newPasswordDto.recoveryCode,
    );
    if (isError(recoveryData)) return recoveryData;
    if (
      recoveryData.recCode === command.newPasswordDto.recoveryCode &&
      recoveryData.expDate > new Date()
    ) {
      const newPass = await this.bcryptAdapter.hashPassword(
        command.newPasswordDto.newPassword,
      );
      return this.usersRepository.newPass(recoveryData.userId, newPass);
    } else {
      return RESPONSE_ERROR.BAD_REQUEST;
    }
  }
}
