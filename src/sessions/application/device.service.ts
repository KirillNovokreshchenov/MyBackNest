import { Injectable } from '@nestjs/common';
import { UserFromRefreshType } from '../../auth/api/input-model/user-from-refresh.type';
import { DeviceRepository } from '../infrastructure/device.repository';
import { Types } from 'mongoose';
import { SessionDocument } from '../domain/session.schema';
import { RESPONSE_OPTIONS } from '../../models/ResponseOptionsEnum';

@Injectable()
export class DeviceService {
  constructor(protected deviceRepo: DeviceRepository) {}
  deleteAllSessions(userFromRefresh: UserFromRefreshType): Promise<boolean> {
    return this.deviceRepo.deleteAllSession(userFromRefresh);
  }

  async deleteSession(
    deviceId: Types.ObjectId,
    userFromRefresh: UserFromRefreshType,
  ): Promise<RESPONSE_OPTIONS> {
    const session: SessionDocument | null =
      await this.deviceRepo.findSessionById(deviceId);
    if (!session) return RESPONSE_OPTIONS.NOT_FOUND;

    if (userFromRefresh.userId.toString() !== session.userId.toString()) {
      return RESPONSE_OPTIONS.FORBIDDEN;
    }

    await this.deviceRepo.deleteSession(deviceId);
    return RESPONSE_OPTIONS.NO_CONTENT;
  }
}
