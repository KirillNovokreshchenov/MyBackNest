import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SessionDto } from '../application/dto/SessionDto';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { UserFromRefreshType } from '../../auth/api/input-model/user-from-refresh.type';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';
import { IdType } from '../../models/IdType';

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
