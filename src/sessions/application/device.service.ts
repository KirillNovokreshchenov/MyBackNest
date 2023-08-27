import { Injectable } from '@nestjs/common';
import { DeviceRepository } from '../infrastructure/device.repository';

@Injectable()
export class DeviceService {
  constructor(protected deviceRepo: DeviceRepository) {}
  // deleteAllSessions(userFromRefresh: UserFromRefreshType): Promise<boolean> {
  //   return this.deviceRepo.deleteAllSession(userFromRefresh);
  // }

  // async deleteSession(
  //   deviceId: Types.ObjectId,
  //   userFromRefresh: UserFromRefreshType,
  // ): Promise<RESPONSE_OPTIONS> {
  //   const session: SessionDocument | null =
  //     await this.deviceRepo.findSessionById(deviceId);
  //   if (!session) return RESPONSE_OPTIONS.NOT_FOUND;
  //
  //   if (userFromRefresh.userId.toString() !== session.userId.toString()) {
  //     return RESPONSE_OPTIONS.FORBIDDEN;
  //   }
  //
  //   await this.deviceRepo.deleteSession(deviceId);
  //   return RESPONSE_OPTIONS.NO_CONTENT;
  // }
}
