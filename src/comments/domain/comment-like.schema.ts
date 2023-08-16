import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';

@Schema()
export class CommentLike {
  _id: Types.ObjectId;
  @Prop({ required: true })
  userId: Types.ObjectId;
  @Prop({ required: true })
  commentId: Types.ObjectId;
  @Prop({ required: true })
  likeStatus: LIKE_STATUS;
  @Prop({ required: true })
  addedAt: Date;
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);
export type CommentLikeModelStaticType = {};
CommentLikeSchema.statics = {};
CommentLikeSchema.methods = {};

export type CommentLikeDocument = HydratedDocument<CommentLike>;
export type CommentLikeModelType = Model<CommentLikeDocument> &
  CommentLikeModelStaticType;
