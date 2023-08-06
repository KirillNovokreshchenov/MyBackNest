import { UserFromRefreshType } from '../../auth/api/input-model/user-from-refresh.type';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionModelType } from '../domain/session.schema';
import { DeviceViewModel } from '../api/view-model/DeviceViewModel';

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
      (session) => new DeviceViewModel(session),
    );
    return mapDevices;
  }
}
