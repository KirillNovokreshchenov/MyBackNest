import { UserFromRefreshType } from '../../../auth/api/input-model/user-from-refresh.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../../infrastructure/device.repository';

export class DeleteAllSessionsCommand {
  constructor(public userFromRefresh: UserFromRefreshType) {}
}
@CommandHandler(DeleteAllSessionsCommand)
export class DeleteAllSessionsUseCase
  implements ICommandHandler<DeleteAllSessionsCommand>
{
  constructor(private deviceRepo: DeviceRepository) {}
  async execute(command: DeleteAllSessionsCommand) {
    return this.deviceRepo.deleteAllSession(command.userFromRefresh);
  }
}
