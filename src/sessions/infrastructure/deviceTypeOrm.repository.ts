import { UserFromRefreshType } from '../../auth/api/input-model/user-from-refresh.type';
import { IdType } from '../../models/IdType';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';
import { SessionDto } from '../application/dto/SessionDto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { Session } from '../domain/entities-typeorm/session.entity';

export class DeviceTypeOrmRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Session) protected sessionRepo: Repository<Session>,
  ) {}

  async createSession(sessionData: SessionDto) {
    const session = new Session();
    session.deviceId = sessionData.deviceId;
    session.lastActiveDate = sessionData.lastActiveDate;
    session.ip = sessionData.ip;
    session.title = sessionData.title;
    session.expirationDate = sessionData.expDate;
    session.userId = sessionData.userId.toString();
    await this.sessionRepo.save(session);
  }

  async updateSession(
    userData: UserFromRefreshType,
    newLastActiveDate: Date,
    expDate: Date,
  ) {
    const session = await this.sessionRepo.findOne({
      where: {
        userId: userData.userId.toString(),
        deviceId: userData.deviceId.toString(),
        lastActiveDate: userData.lastActiveDate,
      },
    });
    if (!session) return RESPONSE_ERROR.UNAUTHORIZED;
    session.lastActiveDate = newLastActiveDate;
    session.expirationDate = expDate;
    await this.sessionRepo.save(session);
    return {
      userId: session.userId,
      ip: session.ip,
      deviceId: session.deviceId,
      title: session.title,
      lastActiveDate: session.lastActiveDate,
      expDate: session.expirationDate,
    };
  }

  async logout(userFromRefresh: UserFromRefreshType) {
    const isDeleted = await this.sessionRepo.delete({
      userId: userFromRefresh.userId.toString(),
      deviceId: userFromRefresh.deviceId.toString(),
      lastActiveDate: userFromRefresh.lastActiveDate,
    });
    if (!isDeleted.affected) return RESPONSE_ERROR.UNAUTHORIZED;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async findSessionById(deviceId: string) {
    const session = await this.sessionRepo.findOne({
      where: { deviceId: deviceId },
    });
    if (!session) return RESPONSE_ERROR.NOT_FOUND;
    return session.userId;
  }

  async deleteSession(deviceId: IdType) {
    const isDeleted = await this.sessionRepo.delete({
      deviceId: deviceId.toString(),
    });
    if (!isDeleted.affected) return RESPONSE_ERROR.SERVER_ERROR;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async deleteAllSession(userFromRefresh: UserFromRefreshType) {
    const isDeleted = await this.sessionRepo.delete({
      userId: userFromRefresh.userId.toString(),
      deviceId: Not(userFromRefresh.deviceId.toString()),
    });
    if (!isDeleted.affected) return RESPONSE_ERROR.SERVER_ERROR;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }
}
