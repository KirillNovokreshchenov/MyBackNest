import { IdType } from '../../../models/IdType';

export type RecoveryDataType = {
  userId: IdType;
  recCode: string;
  expDate: Date;
};
