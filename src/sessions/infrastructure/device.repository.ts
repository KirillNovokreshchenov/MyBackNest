import {
  Session,
  SessionDocument,
  SessionModelType,
} from '../domain/session.schema';
import { UserFromRefreshType } from '../../auth/api/input-model/user-from-refresh.type';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

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
  async findSessionById(deviceId: Types.ObjectId) {
    return this.SessionModel.findOne({ deviceId });
  }

  async logout(userFromRefresh: UserFromRefreshType) {
    const isDeleted = await this.SessionModel.deleteOne(userFromRefresh);
    return isDeleted.deletedCount === 1;
  }

  async deleteAllSession(
    userFromRefresh: UserFromRefreshType,
  ): Promise<boolean> {
    await this.SessionModel.deleteMany({
      $and: [
        { userId: userFromRefresh.userId },
        { deviceId: { $ne: userFromRefresh.deviceId } },
      ],
    });

    const count = await this.SessionModel.countDocuments({
      userId: userFromRefresh.userId,
    });
    return count === 1;
  }

  async deleteSession(deviceId: Types.ObjectId) {
    await this.SessionModel.deleteOne({ deviceId });
  }
}
