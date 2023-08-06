import { Injectable } from '@nestjs/common';
import { UserFromRefreshType } from '../../auth/api/input-model/user-from-refresh.type';

@Injectable()
export class DeviceService {
  deleteAllSessions(userFromRefresh: UserFromRefreshType) {}
}
