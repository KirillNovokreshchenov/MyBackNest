import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';
import { IdType } from '../../models/IdType';

@Schema()
export class CommentLike {
  _id: IdType;
  @Prop({ required: true, type: Types.ObjectId })
  userId: IdType;
  @Prop({ required: true, type: Types.ObjectId })
  commentId: IdType;
  @Prop({ required: true })
  likeStatus: LIKE_STATUS;
  @Prop({ required: true })
  addedAt: Date;
  @Prop({ default: false })
  isBanned: boolean;

  isBannedLike() {
    if (!this.isBanned) {
      this.isBanned = true;
    } else {
      this.isBanned = false;
    }
  }
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);
export type CommentLikeModelStaticType = {};
CommentLikeSchema.statics = {};
CommentLikeSchema.methods = {
  isBannedLike: CommentLike.prototype.isBannedLike,
};

export type CommentLikeDocument = HydratedDocument<CommentLike>;
export type CommentLikeModelType = Model<CommentLikeDocument> &
  CommentLikeModelStaticType;
