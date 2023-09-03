import { SessionDataType } from '../../api/input-model/user-data-request.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Session,
  SessionModelType,
} from '../../../sessions/domain/session.schema';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceRepository } from '../../../sessions/infrastructure/device.repository';
import { AuthService } from '../auth.service';
import { BcryptAdapter } from '../../../users/infrastructure/adapters/bcryptAdapter';

export class CreateTokensCommand {
  constructor(public sessionData: SessionDataType) {}
}
@CommandHandler(CreateTokensCommand)
export class CreateTokensUseCase
  implements ICommandHandler<CreateTokensCommand>
{
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
    private sessionRepo: DeviceRepository,
    private authService: AuthService,
    private bcryptAdapter: BcryptAdapter,
  ) {}
  async execute(command: CreateTokensCommand) {
    const session = await this._createSession(command.sessionData);
    if (!session) return null;
    return this.authService.tokens(session);
  }

  private async _createSession(sessionData: SessionDataType) {
    const expDate = this.bcryptAdapter.addMinutes(30);
    const deviceId = this.bcryptAdapter.uuid();
    const session = {
      userId: sessionData.userId,
      ip: sessionData.ip,
      deviceId: deviceId,
      title: sessionData.deviceName,
      lastActiveDate: new Date(),
      expDate: expDate,
    };
    const isCreated = await this.sessionRepo.createSession(session);
    if (isCreated) return null;
    return session;
  }
}
