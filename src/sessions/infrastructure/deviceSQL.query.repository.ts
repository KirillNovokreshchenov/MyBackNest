import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserFromRefreshType } from '../../auth/api/input-model/user-from-refresh.type';
import { DeviceViewModel } from '../api/view-model/DeviceViewModel';
import { Injectable } from '@nestjs/common';

@Injectable()
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
