import { UserFromRefreshType } from '../../../auth/api/input-model/user-from-refresh.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../../infrastructure/device.repository';
import { isError, RESPONSE_ERROR } from '../../../models/RESPONSE_ERROR';
import { IdType } from '../../../models/IdType';
import { RESPONSE_SUCCESS } from '../../../models/RESPONSE_SUCCESS';

export class DeleteSessionCommand {
  constructor(
    public deviceId: IdType,
    public userFromRefresh: UserFromRefreshType,
  ) {}
}
@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase
  implements ICommandHandler<DeleteSessionCommand>
{
  constructor(private deviceRepo: DeviceRepository) {}
  async execute(command: DeleteSessionCommand) {
    const userId = await this.deviceRepo.findSessionById(command.deviceId);
    if (isError(userId)) return userId;

    if (command.userFromRefresh.userId.toString() !== userId.toString()) {
      return RESPONSE_ERROR.FORBIDDEN;
    }

    return this.deviceRepo.deleteSession(command.deviceId);
  }
}
