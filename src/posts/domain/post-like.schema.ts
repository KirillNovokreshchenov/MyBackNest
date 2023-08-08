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
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);
export type PostLikeModelStaticType = {};
PostLikeSchema.statics = {};
PostLikeSchema.methods = {};

export type PostLikeDocument = HydratedDocument<PostLike>;
export type PostLikeModelType = Model<PostLikeDocument> &
  PostLikeModelStaticType;
