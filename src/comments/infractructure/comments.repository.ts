import { Injectable } from '@nestjs/common';
import {
  Comment,
  CommentDocument,
  CommentModelType,
  PostInfo,
} from '../domain/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  CommentLike,
  CommentLikeDocument,
  CommentLikeModelType,
} from '../domain/comment-like.schema';
import { IdType } from '../../models/IdType';
import { CreateCommentDto } from '../application/dto/CreateCommentDto';
import { Post, PostModelType } from '../../posts/domain/post.schema';
import { UpdateCommentDto } from '../application/dto/UpdateCommentDto';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
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

  async findLikeStatus(userId: IdType, commentId: IdType) {
    const likeStatus = await this.CommentLikeModel.findOne({
      userId,
      commentId,
    });
    if (!likeStatus) return null;
    return { likeId: likeStatus._id, likeStatus: likeStatus.likeStatus };
  }

  async saveStatus(likeStatus: CommentLikeDocument) {
    await likeStatus.save();
  }

  async deleteLikeStatus(_id: Types.ObjectId) {
    await this.CommentLikeModel.deleteOne({ _id });
  }

  async banUnbanComment(userId: Types.ObjectId, isBanned: boolean) {
    const comments = await this.CommentModel.find({ userId });
    await Promise.all(
      comments.map(async (comment) => {
        comment.isBannedComment(isBanned);
        await this.saveComment(comment);
      }),
    );
  }

  async _banUnbanLikesCommentUser(userId: Types.ObjectId, isBanned: boolean) {
    const likesComment = await this.CommentLikeModel.find({ userId });
    await Promise.all(
      likesComment.map(async (like) => {
        like.isBannedLike();
        const comment = await this.findComment(like.commentId);
        if (comment) {
          comment.countBan(like.likeStatus, isBanned);
          await this.saveComment(comment);
        }
        await this.saveStatus(like);
      }),
    );
  }

  async CommentsBlogBan(blogId: IdType, isBanned: boolean) {
    const comments = await this.CommentModel.find({
      'postInfo.blogId': blogId,
    });
    await Promise.all(
      comments.map(async (comment) => {
        comment.isBannedComment(isBanned);
        await this.saveComment(comment);
      }),
    );
  }

  async createComment(
    userId: IdType,
    postId: IdType,
    ownerBlogId: Types.ObjectId,
    userLogin: string,
    commentDto: CreateCommentDto,
  ) {
    const post = await this.PostModel.findById(postId);
    const postInfo: PostInfo = {
      id: post!._id,
      title: post!.title,
      blogId: post!.blogId,
      blogName: post!.blogName,
    };
    const comment = await this.CommentModel.createComment(
      userId,
      ownerBlogId,
      userLogin,
      commentDto,
      postInfo,
      this.CommentModel,
    );
    await this.saveComment(comment);
    return comment._id;
  }

  async findCommentOwnerId(commentId: IdType) {
    const comment = await this.findComment(commentId);
    if (!comment) return null;
    return comment._id;
  }

  async updateComment(commentId: IdType, commentDto: UpdateCommentDto) {
    const comment = await this.findComment(commentId);
    if (!comment) return null;
    comment.updateComment(commentDto);
    await this.saveComment(comment);
  }
  async createLikeStatus(
    userId: IdType,
    commentId: IdType,
    likeStatus: LIKE_STATUS,
  ) {
    const comment = await this.findComment(commentId);
    if (!comment) return null;
    const likeStatusCreated = comment.createLikeStatus(
      userId,
      commentId,
      likeStatus,
      this.CommentLikeModel,
    );
    await this.saveStatus(likeStatusCreated);
    await this.saveComment(comment);
  }
  async updateLikeNone(
    commentId: IdType,
    likeData: { likeId: IdType; likeStatus: LIKE_STATUS },
  ) {
    const comment = await this.findComment(commentId);
    if (!comment) return null;
    comment.updateLikeNone(likeData.likeStatus);
    await this.saveComment(comment);
    await this.deleteLikeStatus(likeData.likeId);
  }
  async updateLike(
    commentId: IdType,
    likeStatus: LIKE_STATUS,
    likeData: { likeId: IdType; likeStatus: LIKE_STATUS },
  ) {
    const comment = await this.findComment(commentId);
    if (!comment) return null;
    const oldLike = await this.CommentLikeModel.findById(likeData.likeId);
    if (!oldLike) return null;
    comment.updateLike(likeStatus, oldLike);
    await this.saveComment(comment);
    await this.saveStatus(oldLike);
  }
}
