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
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
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

export class CommentsSQLRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findCommentId(commentId: IdType) {
    try {
      const comment = await this.dataSource.query(
        `
      SELECT comment_id
      FROM public.comments
      WHERE comment_id = $1;
      `,
        [commentId],
      );
      return comment[0].comment_id;
    } catch (e) {
      return RESPONSE_ERROR.NOT_FOUND;
    }
  }
  async findCommentOwnerId(commentId: IdType) {
    const comment = await this.dataSource.query(
      `
    SELECT owner_id
    FROM public.comments
    WHERE comment_id = $1 AND is_deleted <> true;
    `,
      [commentId],
    );
    if (!comment[0]) return RESPONSE_ERROR.NOT_FOUND;
    return comment[0].owner_id;
  }
  async findLikeStatus(
    userId: IdType,
    commentId: IdType,
  ): Promise<LikeStatusBLType | RESPONSE_ERROR> {
    try {
      const likeData = await this.dataSource.query(
        `
      SELECT  like_status as "likeStatus", like_id as "likeId"
      FROM public.comments_likes
      WHERE comment_id =$1 AND owner_id = $2
      ;
      `,
        [commentId, userId],
      );
      if (!likeData[0]) return RESPONSE_ERROR.NOT_FOUND;
      return likeData[0];
    } catch (e) {
      return RESPONSE_ERROR.NOT_FOUND;
    }
  }

  async createComment(
    userId: IdType,
    postId: IdType,
    commentDto: CreateCommentDto,
  ): Promise<IdType | RESPONSE_ERROR> {
    try {
      const commentId = await this.dataSource.query(
        `
      INSERT INTO public.comments(post_id, owner_id, content)
VALUES ($1, $2, $3)
RETURNING comment_id;
      `,
        [postId, userId, commentDto.content],
      );
      return commentId[0].comment_id;
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }

  async updateComment(
    commentId: IdType,
    commentDto: UpdateCommentDto,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    const comment = await this.dataSource.query(
      `
    UPDATE public.comments
SET content= $1
WHERE comment_id = $2;
    `,
      [commentDto.content, commentId],
    );
    if (comment[1] === 0) return RESPONSE_ERROR.SERVER_ERROR;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }
  async deleteComment(commentId: IdType) {
    await this.dataSource.query(
      `
    UPDATE public.comments
SET is_deleted = true
WHERE comment_id = $1;
    `,
      [commentId],
    );
  }
  async createLikeStatus(
    userId: IdType,
    commentId: IdType,
    likeStatus: LIKE_STATUS,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    try {
      await this.dataSource.query(
        `
        INSERT INTO public.comments_likes(
owner_id, comment_id, like_status)
VALUES ($1, $2, $3);
        `,
        [userId, commentId, likeStatus],
      );
      await this._incrementLikeCount(likeStatus, commentId);
      return RESPONSE_SUCCESS.NO_CONTENT;
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }
  async updateLikeNone(
    commentId: IdType,
    likeData: LikeStatusBLType,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    try {
      await this.dataSource.query(
        `
    DELETE FROM public.comments_likes
WHERE like_id = $1;
    `,
        [likeData.likeId],
      );
      await this._decrementLikeCount(likeData.likeStatus, commentId);
      return RESPONSE_SUCCESS.NO_CONTENT;
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }
  async updateLike(
    commentId: IdType,
    likeStatus: LIKE_STATUS,
    oldLikeData: LikeStatusBLType,
  ) {
    try {
      await this.dataSource.query(
        `
    UPDATE public.comments_likes
SET like_status= $1
WHERE like_id = $2;
    `,
        [likeStatus, oldLikeData.likeId],
      );
      await this._incrementLikeCount(likeStatus, commentId);
      await this._decrementLikeCount(oldLikeData.likeStatus, commentId);
      return RESPONSE_SUCCESS.NO_CONTENT;
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }

  private async _incrementLikeCount(
    likeStatus: LIKE_STATUS,
    commentId: IdType,
  ) {
    if (likeStatus === LIKE_STATUS.LIKE) {
      await this.dataSource.query(
        `
      UPDATE public.comments
SET  like_count= like_count + 1
WHERE comment_id = $1;
      `,
        [commentId],
      );
    } else if (likeStatus === LIKE_STATUS.DISLIKE) {
      await this.dataSource.query(
        `
      UPDATE public.comments
SET  dislike_count= dislike_count + 1
WHERE comment_id = $1;
      `,
        [commentId],
      );
    }
  }
  private async _decrementLikeCount(
    likeStatus: LIKE_STATUS,
    commentId: IdType,
  ) {
    if (likeStatus === LIKE_STATUS.LIKE) {
      await this.dataSource.query(
        `
      UPDATE public.comments
SET  like_count= like_count - 1
WHERE comment_id = $1;
      `,
        [commentId],
      );
    } else if (likeStatus === LIKE_STATUS.DISLIKE) {
      await this.dataSource.query(
        `
      UPDATE public.comments
SET  dislike_count= dislike_count - 1
WHERE comment_id = $1;
      `,
        [commentId],
      );
    }
  }
}
