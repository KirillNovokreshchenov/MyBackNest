import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserFromRefreshType } from '../../api/input-model/user-from-refresh.type';
import { DeviceRepository } from '../../../sessions/infrastructure/device.repository';
import { AuthService } from '../auth.service';

export class NewTokensCommand {
  constructor(public userFromRefresh: UserFromRefreshType) {}
}
@CommandHandler(NewTokensCommand)
export class NewTokensUseCase implements ICommandHandler<NewTokensCommand> {
  constructor(
    private sessionRepo: DeviceRepository,
    private authService: AuthService,
  ) {}
  async execute(command: NewTokensCommand) {
    const session = await this.sessionRepo.findSession(command.userFromRefresh);
    if (!session) return null;
    session.sessionUpdate();
    await this.sessionRepo.saveSession(session);
    return this.authService.tokens(session);
  }
}
