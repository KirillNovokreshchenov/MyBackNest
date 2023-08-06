import {
  Session,
  SessionDocument,
  SessionModelType,
} from '../domain/session.schema';
import { UserFromRefreshType } from '../../auth/api/input-model/user-from-refresh.type';
import { InjectModel } from '@nestjs/mongoose';

export class DeviceRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {}
  async saveSession(session: SessionDocument) {
    await session.save();
  }

  async findSession(
    userFromRefresh: UserFromRefreshType,
  ): Promise<SessionDocument | null> {
    return this.SessionModel.findOne(userFromRefresh);
  }

  async logout(userFromRefresh: UserFromRefreshType) {
    const isDeleted = await this.SessionModel.deleteOne(userFromRefresh);
    return isDeleted.deletedCount === 1;
  }
}
