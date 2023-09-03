import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { SessionDto } from '../application/dto/SessionDto';

@Schema()
export class Session {
  _id: Types.ObjectId;
  @Prop({ required: true })
  userId: Types.ObjectId;
  @Prop({ required: true })
  ip: string;
  @Prop({ required: true })
  deviceId: string;
  @Prop({ default: 'Google' })
  title: string;
  @Prop({ required: true })
  lastActiveDate: Date;
  @Prop({ required: true })
  expDate: Date;

  sessionUpdate(lastDate: Date, expDate: Date) {
    this.lastActiveDate = lastDate;
    this.expDate = expDate;
  }

  static createSession(session: SessionDto, SessionModel: SessionModelType) {
    const sess = new SessionModel({
      userId: session.userId,
      ip: session.ip,
      deviceId: session.deviceId,
      title: session.title,
      lastActiveDate: session.lastActiveDate,
      expDate: session.expDate,
    });
    return sess;
  }
}

export const SessionSchema = SchemaFactory.createForClass(Session);

export type SessionModelStaticType = {
  createSession: (
    session: SessionDto,
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
