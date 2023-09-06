import {
  Session,
  SessionDocument,
  SessionModelType,
} from '../domain/session.schema';
import { UserFromRefreshType } from '../../auth/api/input-model/user-from-refresh.type';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SessionDto } from '../application/dto/SessionDto';
import { IdType } from '../../models/IdType';

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
  async findSessionById(deviceId: IdType) {
    const session = await this.SessionModel.findOne({ deviceId });
    if (!session) return null;
    return session.userId;
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

  async deleteSession(deviceId: IdType) {
    await this.SessionModel.deleteOne({ deviceId });
  }

  async deleteAllSessionsBan(userId: IdType) {
    await this.SessionModel.deleteMany({ userId });
  }

  async createSession(session: SessionDto) {
    const sess: SessionDocument = this.SessionModel.createSession(
      session,
      this.SessionModel,
    );
    if (!sess) return null;
    await this.saveSession(sess);
  }

  async updateSession(
    userData: UserFromRefreshType,
    lastActiveDate: Date,
    expDate: Date,
  ) {
    const session = await this.findSession(userData);
    if (!session) return null;
    session.sessionUpdate(lastActiveDate, expDate);
    return {
      userId: session.userId,
      ip: session.ip,
      deviceId: session.deviceId,
      title: session.title,
      lastActiveDate: session.lastActiveDate,
      expDate: session.expDate,
    };
  }
}
