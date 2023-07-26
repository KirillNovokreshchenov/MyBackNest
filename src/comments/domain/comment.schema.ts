import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import {
  LikesInfo,
  LikesInfoSchema,
  PostSchema,
} from '../../posts/domain/post.schema';

@Schema()
export class Comment {
  _id: Types.ObjectId;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  userId: Types.ObjectId;
  @Prop({ required: true })
  userLogin: string;
  @Prop({ required: true })
  postId: Types.ObjectId;
  @Prop({ default: new Date() })
  createdAt: Date;
  @Prop({ default: {}, type: LikesInfoSchema })
  likesInfo: LikesInfo;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);

export type CommentModelStaticType = {};

CommentSchema.statics = {};
CommentSchema.methods = {};

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & CommentModelStaticType;
