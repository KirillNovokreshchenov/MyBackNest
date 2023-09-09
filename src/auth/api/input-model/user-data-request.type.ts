import { IdType } from '../../../models/IdType';

export type SessionDataType = {
  userId: IdType;
  ip: string;
  deviceName: string;
};
