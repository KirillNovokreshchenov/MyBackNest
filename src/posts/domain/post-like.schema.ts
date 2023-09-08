import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { LIKE_STATUS } from "../../models/LikeStatusEnum";
import { IdType } from "../../models/IdType";

@Schema()
export class PostLike {
  _id: IdType;
  @Prop({ required: true, type: Types.ObjectId })
  userId: IdType;
  @Prop({ required: true })
  login: string;
  @Prop({ required: true, type: Types.ObjectId })
  postId: IdType;
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
