import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { LikesInfo, LikesInfoSchema } from '../../posts/domain/post.schema';
import { CreateCommentDto } from '../application/dto/CreateCommentDto';
import { UpdateCommentDto } from '../application/dto/UpdateCommentDto';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';
import {
  CommentLikeDocument,
  CommentLikeModelType,
} from './comment-like.schema';

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
  @Prop({ required: true })
  createdAt: Date;
  @Prop({ default: {}, type: LikesInfoSchema })
  likesInfo: LikesInfo;

  updateComment(commentDto: UpdateCommentDto) {
    this.content = commentDto.content;
  }

  static createComment(
    userId: Types.ObjectId,
    postId: Types.ObjectId,
    userLogin,
    commentDto: CreateCommentDto,
    CommentModel: CommentModelType,
  ) {
    return new CommentModel({
      ...commentDto,
      userId,
      postId,
      userLogin,
      createdAt: new Date(),
    });
  }
  createLikeStatus(
    userId: Types.ObjectId,
    commentId: Types.ObjectId,
    likeStatus: LIKE_STATUS,
    CommentLikeModel: CommentLikeModelType,
  ): CommentLikeDocument {
    if (likeStatus === LIKE_STATUS.LIKE) {
      this.likesInfo.likesCount += 1;
    } else {
      this.likesInfo.dislikesCount += 1;
    }
    return new CommentLikeModel({
      userId,
      commentId,
      likeStatus,
      addedAt: new Date(),
    });
  }
  updateLikeNone(oldLike: LIKE_STATUS) {
    if (oldLike === LIKE_STATUS.LIKE) {
      this.likesInfo.likesCount -= 1;
    } else {
      this.likesInfo.dislikesCount -= 1;
    }
  }

  updateLike(currentLike: LIKE_STATUS, oldLike: CommentLikeDocument) {
    if (currentLike === oldLike.likeStatus) return;
    if (currentLike === LIKE_STATUS.LIKE) {
      this.likesInfo.likesCount += 1;
      this.likesInfo.dislikesCount -= 1;
      oldLike.likeStatus = LIKE_STATUS.LIKE;
    } else {
      this.likesInfo.likesCount -= 1;
      this.likesInfo.dislikesCount += 1;
      oldLike.likeStatus = LIKE_STATUS.DISLIKE;
    }
  }
}
export const CommentSchema = SchemaFactory.createForClass(Comment);

export type CommentModelStaticType = {
  createComment: (
    userId: Types.ObjectId,
    postId: Types.ObjectId,
    userLogin,
    commentDto: CreateCommentDto,
    CommentModel: CommentModelType,
  ) => CommentDocument;
};

CommentSchema.statics = {
  createComment: Comment.createComment,
};
CommentSchema.methods = {
  updateComment: Comment.prototype.updateComment,
  createLikeStatus: Comment.prototype.createLikeStatus,
  updateLike: Comment.prototype.updateLike,
  updateLikeNone: Comment.prototype.updateLikeNone,
};

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & CommentModelStaticType;
