import { UserDataType } from '../../api/input-model/user-data-request.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Session,
  SessionDocument,
  SessionModelType,
} from '../../../sessions/domain/session.schema';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceRepository } from '../../../sessions/infrastructure/device.repository';
import { AuthService } from '../auth.service';

export class CreateTokensCommand {
  constructor(public userData: UserDataType) {}
}
@CommandHandler(CreateTokensCommand)
export class CreateTokensUseCase
  implements ICommandHandler<CreateTokensCommand>
{
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
    private sessionRepo: DeviceRepository,
    private authService: AuthService,
  ) {}
  async execute(command: CreateTokensCommand) {
    const session: SessionDocument = this.SessionModel.createSession(
      command.userData,
      this.SessionModel,
    );
    await this.sessionRepo.saveSession(session);
    return this.authService.tokens(session);
  }
}
