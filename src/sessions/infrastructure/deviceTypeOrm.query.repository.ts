import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserFromRefreshType } from '../../auth/api/input-model/user-from-refresh.type';
import { DeviceViewModel } from '../api/view-model/DeviceViewModel';
import { Session } from '../domain/entities-typeorm/session.entity';

@Injectable()
export class DeviceTypeOrmQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Session) protected sessionRepo: Repository<Session>,
  ) {}

  async findAllSession(
    userFromRefresh: UserFromRefreshType,
  ): Promise<DeviceViewModel[]> {
    return this.sessionRepo.find({
      select: { ip: true, lastActiveDate: true, deviceId: true, title: true },
      where: { userId: userFromRefresh.userId.toString() },
    });
  }
}
