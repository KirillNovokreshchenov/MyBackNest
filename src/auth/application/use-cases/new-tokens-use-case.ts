import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserFromRefreshType } from '../../api/input-model/user-from-refresh.type';
import { DeviceRepository } from '../../../sessions/infrastructure/device.repository';
import { AuthService } from '../auth.service';
import { BcryptAdapter } from '../../../users/infrastructure/adapters/bcryptAdapter';
import { isError } from '../../../models/RESPONSE_ERROR';

export class NewTokensCommand {
  constructor(public userFromRefresh: UserFromRefreshType) {}
}
@CommandHandler(NewTokensCommand)
export class NewTokensUseCase implements ICommandHandler<NewTokensCommand> {
  constructor(
    private sessionRepo: DeviceRepository,
    private authService: AuthService,
    private bcryptAdapter: BcryptAdapter,
  ) {}
  async execute(command: NewTokensCommand) {
    // const session = await this.sessionRepo.findSession(command.userFromRefresh);
    // if (!session) return null;
    const session = await this._updateSession(command.userFromRefresh);
    if (isError(session)) return session;
    return this.authService.tokens(session);
  }
  private async _updateSession(userData: UserFromRefreshType) {
    const lastActiveDate = new Date();
    const expDate = this.bcryptAdapter.addMinutes(30);
    const session = await this.sessionRepo.updateSession(
      userData,
      lastActiveDate,
      expDate,
    );
    return session;
  }
}
