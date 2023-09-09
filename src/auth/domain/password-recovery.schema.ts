import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { RecoveryPasswordDto } from '../../users/application/dto/RecoveryPasswordDto';
import { IdType } from '../../models/IdType';

@Schema()
export class PasswordRecovery {
  @Prop({ type: Types.ObjectId })
  userId: IdType;
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  recoveryCode: string;
  @Prop({ required: true })
  expirationDate: Date;
  static createRecovery(
    recoveryModel: PasswordRecoveryType,
    recoveryPas: RecoveryPasswordDto,
  ): PasswordRecoveryDocument {
    const recovery = new recoveryModel({
      userId: recoveryPas.userId,
      email: recoveryPas.email,
      recoveryCode: recoveryPas.recoveryCode,
      expirationDate: recoveryPas.expirationDate,
    });
    return recovery;
  }
}
export const PasswordRecoverySchema =
  SchemaFactory.createForClass(PasswordRecovery);

export type PasswordRecoveryStaticType = {
  createRecovery: (
    recoveryModel: PasswordRecoveryType,
    recoveryPas: RecoveryPasswordDto,
  ) => PasswordRecoveryDocument;
};

PasswordRecoverySchema.methods = {};

PasswordRecoverySchema.statics = {
  createRecovery: PasswordRecovery.createRecovery,
};

export type PasswordRecoveryDocument = HydratedDocument<PasswordRecovery>;

export type PasswordRecoveryType = Model<PasswordRecoveryDocument> &
  PasswordRecoveryStaticType;
