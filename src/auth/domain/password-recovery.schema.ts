import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
@Schema()
export class PasswordRecovery {
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  recoveryCode: string;
  @Prop({ required: true })
  expirationDate: Date;
  canBeRecovery(recoveryCode: string) {
    return (
      this.recoveryCode === recoveryCode && this.expirationDate > new Date()
    );
  }
  static createRecovery(
    recoveryModel: PasswordRecoveryType,
    email: string,
  ): PasswordRecoveryDocument {
    const recovery = new recoveryModel({
      email: email,
      recoveryCode: uuidv4(),
      expirationDate: add(new Date(), {
        minutes: 60,
      }),
    });
    return recovery;
  }
}
export const PasswordRecoverySchema =
  SchemaFactory.createForClass(PasswordRecovery);

export type PasswordRecoveryStaticType = {
  createRecovery: (
    recoveryModel: PasswordRecoveryType,
    email: string,
  ) => PasswordRecoveryDocument;
};

PasswordRecoverySchema.methods = {
  canBeRecovery: PasswordRecovery.prototype.canBeRecovery,
};

PasswordRecoverySchema.statics = {
  createRecovery: PasswordRecovery.createRecovery,
};

export type PasswordRecoveryDocument = HydratedDocument<PasswordRecovery>;

export type PasswordRecoveryType = Model<PasswordRecoveryDocument> &
  PasswordRecoveryStaticType;
