import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';

@Schema()
export class PostLike {
  @Prop({ required: true })
  userId: Types.ObjectId;
  @Prop({ required: true })
  login: string;
  @Prop({ required: true })
  postId: Types.ObjectId;
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

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);
export type PostLikeModelStaticType = {};
PostLikeSchema.statics = {};
PostLikeSchema.methods = {
  isBannedLike: PostLike.prototype.isBannedLike,
};

export type PostLikeDocument = HydratedDocument<PostLike>;
export type PostLikeModelType = Model<PostLikeDocument> &
  PostLikeModelStaticType;
