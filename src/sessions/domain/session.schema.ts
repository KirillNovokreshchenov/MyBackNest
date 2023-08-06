import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { UserDataType } from '../../auth/api/input-model/user-data-request.type';
import { add } from 'date-fns';

@Schema()
export class Session {
  _id: Types.ObjectId;
  @Prop({ required: true })
  userId: Types.ObjectId;
  @Prop({ required: true })
  ip: string;
  @Prop({ required: true })
  deviceId: Types.ObjectId;
  @Prop({ default: 'Google' })
  title: string;
  @Prop({ required: true })
  lastActiveDate: Date;
  @Prop({ required: true })
  expDate: Date;

  sessionUpdate() {
    this.lastActiveDate = new Date();
    this.expDate = add(new Date(), {
      minutes: 30,
    });
  }

  static createSession(userData: UserDataType, SessionModel: SessionModelType) {
    const session = new SessionModel({
      userId: userData.userId,
      ip: userData.ip,
      deviceId: new Types.ObjectId(),
      title: userData.deviceName,
      lastActiveDate: new Date(),
      expDate: add(new Date(), {
        minutes: 30,
      }),
    });
    return session;
  }
}

export const SessionSchema = SchemaFactory.createForClass(Session);

export type SessionModelStaticType = {
  createSession: (
    userData: UserDataType,
    SessionModel: SessionModelType,
  ) => SessionDocument;
};

SessionSchema.statics = {
  createSession: Session.createSession,
};
SessionSchema.methods = {
  sessionUpdate: Session.prototype.sessionUpdate,
};
export type SessionDocument = HydratedDocument<Session>;
export type SessionModelType = Model<SessionDocument> & SessionModelStaticType;
