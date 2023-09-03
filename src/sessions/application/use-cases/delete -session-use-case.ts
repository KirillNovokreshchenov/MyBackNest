import { UserFromRefreshType } from '../../../auth/api/input-model/user-from-refresh.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../../infrastructure/device.repository';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';
import { IdType } from '../../../models/IdType';

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
    if (!userId) return RESPONSE_OPTIONS.NOT_FOUND;

    if (command.userFromRefresh.userId.toString() !== userId.toString()) {
      return RESPONSE_OPTIONS.FORBIDDEN;
    }

    await this.deviceRepo.deleteSession(command.deviceId);
    return RESPONSE_OPTIONS.NO_CONTENT;
  }
}
