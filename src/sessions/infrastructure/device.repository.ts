import {
  Session,
  SessionDocument,
  SessionModelType,
} from '../domain/session.schema';
import { UserFromRefreshType } from '../../auth/api/input-model/user-from-refresh.type';
import { InjectModel } from '@nestjs/mongoose';
import { SessionDto } from '../application/dto/SessionDto';
import { IdType } from '../../models/IdType';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
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

export class DeviceSQLRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createSession(session: SessionDto) {
    try {
      await this.dataSource.query(
        `
      INSERT INTO public.sessions(
user_id, ip, device_id, title, last_active_date, expiration_date)
VALUES ($1, $2, $3, $4, $5, $6);
      `,
        [
          session.userId,
          session.ip,
          session.deviceId,
          session.title,
          session.lastActiveDate,
          session.expDate,
        ],
      );
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }

  async updateSession(
    userData: UserFromRefreshType,
    lastActiveDate: Date,
    expDate: Date,
  ) {
    try {
      const session = await this.dataSource.query(
        `
      UPDATE public.sessions
SET last_active_date= $4, expiration_date=$5
WHERE user_id = $1 AND device_id = $2 AND last_active_date = $3
RETURNING user_id, ip, device_id, title, last_active_date, expiration_date;
      `,
        [
          userData.userId,
          userData.deviceId,
          userData.lastActiveDate,
          lastActiveDate,
          expDate,
        ],
      );
      if (!session[1]) return RESPONSE_ERROR.SERVER_ERROR;

      return {
        userId: session[0][0].user_id,
        ip: session[0][0].ip,
        deviceId: session[0][0].device_id,
        title: session[0][0].title,
        lastActiveDate: session[0][0].last_active_date,
        expDate: session[0][0].expiration_date,
      };
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }

  async logout(userFromRefresh: UserFromRefreshType) {
    const isDeleted = await this.dataSource.query(
      `
    DELETE FROM public.sessions
WHERE user_id = $1 AND device_id = $2 AND last_active_date = $3;
    `,
      [
        userFromRefresh.userId,
        userFromRefresh.deviceId,
        userFromRefresh.lastActiveDate,
      ],
    );
    if (isDeleted[1] !== 1) return RESPONSE_ERROR.SERVER_ERROR;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async findSessionById(deviceId: IdType) {
    try {
      const session = await this.dataSource.query(
        `
      SELECT user_id
FROM public.sessions
WHERE device_id = $1;
      `,
        [deviceId],
      );
      return session[0].user_id;
    } catch (e) {
      return RESPONSE_ERROR.NOT_FOUND;
    }
  }

  async deleteSession(deviceId: IdType) {
    try {
      await this.dataSource.query(
        `
    DELETE FROM public.sessions
WHERE device_id = $1;
    `,
        [deviceId],
      );
      return RESPONSE_SUCCESS.NO_CONTENT;
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }

  async deleteAllSession(userFromRefresh: UserFromRefreshType) {
    const isDeleted = await this.dataSource.query(
      `
    DELETE FROM public.sessions
WHERE user_id = $1 AND device_id <> $2;
    `,
      [userFromRefresh.userId, userFromRefresh.deviceId],
    );
    if (isDeleted[1] !== 0) return RESPONSE_SUCCESS.NO_CONTENT;
    return RESPONSE_ERROR.SERVER_ERROR;
  }
}
