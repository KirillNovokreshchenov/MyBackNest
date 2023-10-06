import { IdType } from '../../../models/IdType';

export type EmailConfirmDataType = {
  userId: IdType;
  expDate: Date;
  isConfirmed: boolean;
};
