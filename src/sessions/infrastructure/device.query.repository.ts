import { UserFromRefreshType } from '../../auth/api/input-model/user-from-refresh.type';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionModelType } from '../domain/session.schema';
import {
  DeviceMongoViewModel,
  DeviceViewModel,
} from '../api/view-model/DeviceViewModel';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class DeviceQueryRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {}

  async findAllSession(
    userFromRefresh: UserFromRefreshType,
  ): Promise<DeviceViewModel[]> {
    const allSession = await this.SessionModel.find({
      userId: userFromRefresh.userId,
    }).lean();

    const mapDevices = allSession.map(
      (session) => new DeviceMongoViewModel(session),
    );
    return mapDevices;
  }
}

export class DeviceSQLQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findAllSession(
    userFromRefresh: UserFromRefreshType,
  ): Promise<DeviceViewModel[]> {
    return this.dataSource.query(
      `
   SELECT ip, title, last_active_date as "lastActiveDate", device_id as "deviceId"
   FROM public.sessions
   WHERE user_id = $1;
   
    `,
      [userFromRefresh.userId],
    );
  }
}
