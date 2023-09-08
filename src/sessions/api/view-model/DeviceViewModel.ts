import { SessionDocument } from '../../domain/session.schema';

export class DeviceViewModel {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}
export class DeviceMongoViewModel extends DeviceViewModel {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
  constructor(deviceSession: SessionDocument) {
    super();
    this.ip = deviceSession.ip;
    this.title = deviceSession.title;
    this.lastActiveDate = deviceSession.lastActiveDate.toISOString();
    this.deviceId = deviceSession.deviceId.toString();
  }
}
// export class DeviceSQLViewModel extends DeviceViewModel {
//   ip: string;
//   title: string;
//   lastActiveDate: string;
//   deviceId: string;
//   constructor(deviceSession: SessionSQLType) {
//     super();
//     this.ip = deviceSession.ip;
//     this.title = deviceSession.title;
//     this.lastActiveDate = deviceSession.lastActiveDate;
//     this.deviceId = deviceSession.deviceId;
//   }
// }
