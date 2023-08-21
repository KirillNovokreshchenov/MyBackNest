import { Injectable } from '@nestjs/common';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  CommentLike,
  CommentLikeDocument,
  CommentLikeModelType,
} from '../domain/comment-like.schema';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
  ) {}
  async saveComment(comment: CommentDocument) {
    await comment.save();
  }

  findComment(commentId: Types.ObjectId): Promise<CommentDocument | null> {
    return this.CommentModel.findById(commentId);
  }

  async deleteComment(commentId: Types.ObjectId) {
    await this.CommentModel.deleteOne(commentId);
  }

  async findLikeStatus(
    userId: Types.ObjectId,
    commentId: Types.ObjectId,
  ): Promise<CommentLikeDocument | null> {
    return this.CommentLikeModel.findOne({ userId, commentId });
  }

  async saveStatus(likeStatus: CommentLikeDocument) {
    await likeStatus.save();
  }

  async deleteLikeStatus(_id: Types.ObjectId) {
    await this.CommentLikeModel.deleteOne({ _id });
  }

  findCommentsBan(userId: Types.ObjectId) {
    return this.CommentModel.find({ userId });
  }

  async findLikesBan(userId: Types.ObjectId) {
    return this.CommentLikeModel.find({ userId });
  }

  async findCommentsBlogBan(blogId: Types.ObjectId) {
    return this.CommentModel.find({ 'postInfo.blogId': blogId });
  }
}
