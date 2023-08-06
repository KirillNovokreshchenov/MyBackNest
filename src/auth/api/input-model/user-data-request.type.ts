import { Types } from 'mongoose';

export type UserDataType = {
  userId: Types.ObjectId;
  ip: string;
  deviceName: string;
};
