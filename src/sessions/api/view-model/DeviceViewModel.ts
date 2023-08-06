import { SessionDocument } from '../../domain/session.schema';

export class DeviceViewModel {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
  constructor(deviceSession: SessionDocument) {
    this.ip = deviceSession.ip;
    this.title = deviceSession.title;
    this.lastActiveDate = deviceSession.lastActiveDate.toISOString();
    this.deviceId = deviceSession.deviceId.toString();
  }
}
