import { UserFromRefreshType } from '../../../auth/api/input-model/user-from-refresh.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../../infrastructure/device.repository';
import { RESPONSE_ERROR } from '../../../models/RESPONSE_ERROR';
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
    const userId: IdType | null = await this.deviceRepo.findSessionById(
      command.deviceId,
    );
    if (!userId) return RESPONSE_ERROR.NOT_FOUND;

    if (command.userFromRefresh.userId.toString() !== userId.toString()) {
      return RESPONSE_ERROR.FORBIDDEN;
    }

    await this.deviceRepo.deleteSession(command.deviceId);
    return RESPONSE_SUCCESS.NO_CONTENT;
  }
}
