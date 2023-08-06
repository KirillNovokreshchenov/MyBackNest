import { Types } from 'mongoose';

export type UserFromRefreshType = {
  userId: Types.ObjectId;
  deviceId: Types.ObjectId;
  lastActiveDate: Date;
};
