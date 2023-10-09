import {
  Session,
  SessionDocument,
  SessionModelType,
} from '../domain/session.schema';
import { UserFromRefreshType } from '../../auth/api/input-model/user-from-refresh.type';
import { InjectModel } from '@nestjs/mongoose';
import { SessionDto } from '../application/dto/SessionDto';
import { IdType } from '../../models/IdType';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';

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
  async findSessionById(deviceId: IdType): Promise<IdType | RESPONSE_ERROR> {
    const session = await this.SessionModel.findOne({ deviceId });
    if (!session) return RESPONSE_ERROR.NOT_FOUND;
    return session.userId;
  }

  async logout(userFromRefresh: UserFromRefreshType) {
    const isDeleted = await this.SessionModel.deleteOne(userFromRefresh);
    if (isDeleted.deletedCount !== 1) return RESPONSE_ERROR.SERVER_ERROR;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async deleteAllSession(
    userFromRefresh: UserFromRefreshType,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    await this.SessionModel.deleteMany({
      $and: [
        { userId: userFromRefresh.userId },
        { deviceId: { $ne: userFromRefresh.deviceId } },
      ],
    });

    const count = await this.SessionModel.countDocuments({
      userId: userFromRefresh.userId,
    });
    if (count === 1) return RESPONSE_SUCCESS.NO_CONTENT;
    return RESPONSE_ERROR.SERVER_ERROR;
  }

  async deleteSession(deviceId: IdType) {
    const isDeleted = await this.SessionModel.deleteOne({ deviceId });
    if (isDeleted.deletedCount === 1) return RESPONSE_SUCCESS.NO_CONTENT;
    return RESPONSE_ERROR.SERVER_ERROR;
  }

  async deleteAllSessionsBan(userId: IdType) {
    await this.SessionModel.deleteMany({ userId });
  }

  async createSession(session: SessionDto) {
    const sess: SessionDocument = this.SessionModel.createSession(
      session,
      this.SessionModel,
    );
    if (!sess) return RESPONSE_ERROR.SERVER_ERROR;
    await this.saveSession(sess);
  }

  async updateSession(
    userData: UserFromRefreshType,
    lastActiveDate: Date,
    expDate: Date,
  ) {
    const session = await this.findSession(userData);
    if (!session) return RESPONSE_ERROR.SERVER_ERROR;
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
