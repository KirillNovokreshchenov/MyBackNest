import { Types } from 'mongoose';
import { UserFromRefreshType } from '../../../auth/api/input-model/user-from-refresh.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../../infrastructure/device.repository';
import { SessionDocument } from '../../domain/session.schema';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';

export class DeleteSessionCommand {
  constructor(
    public deviceId: Types.ObjectId,
    public userFromRefresh: UserFromRefreshType,
  ) {}
}
@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase
  implements ICommandHandler<DeleteSessionCommand>
{
  constructor(private deviceRepo: DeviceRepository) {}
  async execute(command: DeleteSessionCommand) {
    const session: SessionDocument | null =
      await this.deviceRepo.findSessionById(command.deviceId);
    if (!session) return RESPONSE_OPTIONS.NOT_FOUND;

    if (
      command.userFromRefresh.userId.toString() !== session.userId.toString()
    ) {
      return RESPONSE_OPTIONS.FORBIDDEN;
    }

    await this.deviceRepo.deleteSession(command.deviceId);
    return RESPONSE_OPTIONS.NO_CONTENT;
  }
}
