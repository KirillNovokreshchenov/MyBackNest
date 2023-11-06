import { Injectable } from '@nestjs/common';
import {
  Comment,
  CommentDocument,
  CommentModelType,
  PostInfo,
} from '../domain/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
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
import { User, UserModelType } from '../../users/domain/user.schema';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';
import { LikeStatusBLType } from '../../models/LikeStatusBLType';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {}
  async saveComment(comment: CommentDocument) {
    await comment.save();
  }

  findComment(commentId: IdType): Promise<CommentDocument | null> {
    return this.CommentModel.findById(commentId);
  }

  async deleteComment(commentId: IdType) {
    await this.CommentModel.deleteOne({ _id: commentId });
  }

  async findLikeStatus(
    userId: IdType,
    commentId: IdType,
  ): Promise<LikeStatusBLType | RESPONSE_ERROR> {
    const likeStatus = await this.CommentLikeModel.findOne({
      userId,
      commentId,
    });
    if (!likeStatus) return RESPONSE_ERROR.NOT_FOUND;
    return { likeId: likeStatus._id, likeStatus: likeStatus.likeStatus };
  }

  async saveStatus(likeStatus: CommentLikeDocument) {
    await likeStatus.save();
  }

  async deleteLikeStatus(_id: IdType) {
    await this.CommentLikeModel.deleteOne({ _id });
  }

  async banUnbanComment(userId: IdType, isBanned: boolean) {
    const comments = await this.CommentModel.find({ userId });
    await Promise.all(
      comments.map(async (comment) => {
        comment.isBannedComment(isBanned);
        await this.saveComment(comment);
      }),
    );
  }

  async _banUnbanLikesCommentUser(userId: IdType, isBanned: boolean) {
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
    commentDto: CreateCommentDto,
  ): Promise<IdType | RESPONSE_ERROR> {
    const post = await this.PostModel.findById(postId);
    if (!post) return RESPONSE_ERROR.SERVER_ERROR;
    const postInfo: PostInfo = {
      id: post._id,
      title: post.title,
      blogId: post.blogId,
      blogName: post.blogName,
    };
    const user = await this.UserModel.findById(userId);
    if (!user) return RESPONSE_ERROR.NOT_FOUND;
    const comment = await this.CommentModel.createComment(
      userId,
      post.userId,
      user.login,
      commentDto,
      postInfo,
      this.CommentModel,
    );
    await this.saveComment(comment);
    return comment._id;
  }

  async findCommentOwnerId(
    commentId: IdType,
  ): Promise<IdType | RESPONSE_ERROR> {
    const comment = await this.findComment(commentId);
    if (!comment) return RESPONSE_ERROR.NOT_FOUND;
    return comment.userId;
  }

  async updateComment(
    commentId: IdType,
    commentDto: UpdateCommentDto,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    const comment = await this.findComment(commentId);
    if (!comment) return RESPONSE_ERROR.SERVER_ERROR;
    comment.updateComment(commentDto);
    await this.saveComment(comment);
    return RESPONSE_SUCCESS.NO_CONTENT;
  }
  async createLikeStatus(
    userId: IdType,
    commentId: IdType,
    likeStatus: LIKE_STATUS,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    const comment = await this.findComment(commentId);
    if (!comment) return RESPONSE_ERROR.SERVER_ERROR;
    const likeStatusCreated = comment.createLikeStatus(
      userId,
      commentId,
      likeStatus,
      this.CommentLikeModel,
    );
    await this.saveStatus(likeStatusCreated);
    await this.saveComment(comment);
    return RESPONSE_SUCCESS.NO_CONTENT;
  }
  async updateLikeNone(
    commentId: IdType,
    likeData: LikeStatusBLType,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    const comment = await this.findComment(commentId);
    if (!comment) return RESPONSE_ERROR.SERVER_ERROR;
    comment.updateLikeNone(likeData.likeStatus);
    await this.saveComment(comment);
    await this.deleteLikeStatus(likeData.likeId);
    return RESPONSE_SUCCESS.NO_CONTENT;
  }
  async updateLike(
    commentId: IdType,
    newLikeStatus: LIKE_STATUS,
    likeData: LikeStatusBLType,
  ) {
    const comment = await this.findComment(commentId);
    if (!comment) return RESPONSE_ERROR.SERVER_ERROR;
    const oldLike = await this.CommentLikeModel.findById(likeData.likeId);
    if (!oldLike) return RESPONSE_ERROR.SERVER_ERROR;
    comment.updateLike(newLikeStatus, oldLike);
    await this.saveComment(comment);
    await this.saveStatus(oldLike);
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async findCommentId(commentId: IdType): Promise<IdType | RESPONSE_ERROR> {
    const comment = await this.findComment(commentId);
    if (!comment) return RESPONSE_ERROR.NOT_FOUND;
    return comment._id;
  }
}
