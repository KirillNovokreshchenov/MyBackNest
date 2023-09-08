import { IdType } from "../../../models/IdType";

export class RecoveryPasswordDto {
  userId: IdType;
  email: string;
  recoveryCode: string;
  expirationDate: Date;
}
