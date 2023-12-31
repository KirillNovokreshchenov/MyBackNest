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
import { IdType } from '../../models/IdType';

@Schema()
export class PostInfo {
  @Prop({ required: true, type: Types.ObjectId })
  id: IdType;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true, type: Types.ObjectId })
  blogId: IdType;
  @Prop({ required: true })
  blogName: string;
}
const PostInfoSchema = SchemaFactory.createForClass(PostInfo);
@Schema()
export class Comment {
  _id: IdType;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true, type: Types.ObjectId })
  userId: IdType;
  @Prop({ required: true, type: Types.ObjectId })
  ownerBlogId: IdType;
  @Prop({ required: true })
  userLogin: string;
  // @Prop({ required: true })
  // postId: Types.ObjectId;
  @Prop({ required: true })
  createdAt: Date;
  @Prop({ default: {}, type: LikesInfoSchema })
  likesInfo: LikesInfo;
  @Prop({ required: true, type: PostInfoSchema })
  postInfo: PostInfo;
  @Prop({ default: false })
  isBanned: boolean;

  updateComment(commentDto: UpdateCommentDto) {
    this.content = commentDto.content;
  }
  countBan(likeStatus: LIKE_STATUS, isBanned: boolean) {
    if (isBanned) {
      if (likeStatus === LIKE_STATUS.LIKE) {
        this.likesInfo.likesCount -= 1;
      } else {
        this.likesInfo.dislikesCount -= 1;
      }
    } else {
      if (likeStatus === LIKE_STATUS.LIKE) {
        this.likesInfo.likesCount += 1;
      } else {
        this.likesInfo.dislikesCount += 1;
      }
    }
  }
  isBannedComment(isBanned: boolean) {
    this.isBanned = isBanned;
  }
  static createComment(
    userId: IdType,
    ownerBlogId: IdType,
    userLogin: string,
    commentDto: CreateCommentDto,
    postInfo: PostInfo,
    CommentModel: CommentModelType,
  ) {
    return new CommentModel({
      ...commentDto,
      userId,
      ownerBlogId,
      userLogin,
      postInfo,
      createdAt: new Date(),
    });
  }
  createLikeStatus(
    userId: IdType,
    commentId: IdType,
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
    userId: IdType,
    ownerBlogId: IdType,
    userLogin: string,
    commentDto: CreateCommentDto,
    postInfo: PostInfo,
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
  isBannedComment: Comment.prototype.isBannedComment,
  countBan: Comment.prototype.countBan,
};

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & CommentModelStaticType;
