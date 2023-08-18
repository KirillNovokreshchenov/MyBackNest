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
