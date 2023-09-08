import { IdType } from "../../../models/IdType";

export type UserFromRefreshType = {
  userId: IdType;
  deviceId: IdType;
  lastActiveDate: Date;
};
