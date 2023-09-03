import { IdType } from '../../../models/IdType';

export class SessionDto {
  userId: IdType;
  ip: string;
  deviceId: string;
  title: string;
  lastActiveDate: Date;
  expDate: Date;
}
