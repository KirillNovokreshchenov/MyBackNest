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
  ) {
    const post = await this.PostModel.findById(postId);
    if (!post) return null;
    const postInfo: PostInfo = {
      id: post._id,
      title: post.title,
      blogId: post.blogId,
      blogName: post.blogName,
    };
    const user = await this.UserModel.findById(userId);
    if (!user) return null;
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

  async findCommentOwnerId(commentId: IdType) {
    const comment = await this.findComment(commentId);
    if (!comment) return null;
    return comment.userId;
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

  async findCommentId(commentId: IdType) {
    const comment = await this.findComment(commentId);
    if (!comment) return null;
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
      return null;
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
    if (!comment[0]) return null;
    return comment[0].owner_id;
  }
  async findLikeStatus(userId: IdType, commentId: IdType) {
    try {
      const likeStatus = await this.dataSource.query(
        `
      SELECT  like_status as "likeStatus", like_id as "likeId"
      FROM public.comments_likes
      WHERE comment_id =$1 AND owner_id = $2
      ;
      `,
        [commentId, userId],
      );
      return likeStatus[0];
    } catch (e) {
      return null;
    }
  }

  async createComment(
    userId: IdType,
    postId: IdType,
    commentDto: CreateCommentDto,
  ) {
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
      return null;
    }
  }

  async updateComment(commentId: IdType, commentDto: UpdateCommentDto) {
    const comment = await this.dataSource.query(
      `
    UPDATE public.comments
SET content= $1
WHERE comment_id = $2;
    `,
      [commentDto.content, commentId],
    );
    if (comment[1] === 0) return null;
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
  ) {
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
    } catch (e) {
      return null;
    }
  }
  async updateLikeNone(
    commentId: IdType,
    likeData: { likeId: IdType; likeStatus: LIKE_STATUS },
  ) {
    const isDeleted = await this.dataSource.query(
      `
    DELETE FROM public.comments_likes
WHERE like_id = $1;
    `,
      [likeData.likeId],
    );
    if (isDeleted[1] === 0) return null;
    await this._decrementLikeCount(likeData.likeStatus, commentId);
  }
  async updateLike(
    commentId: IdType,
    likeStatus: LIKE_STATUS,
    likeData: { likeId: IdType; likeStatus: LIKE_STATUS },
  ) {
    try {
      await this.dataSource.query(
        `
    UPDATE public.comments_likes
SET like_status= $1
WHERE like_id = $2;
    `,
        [likeStatus, likeData.likeId],
      );
      await this._incrementLikeCount(likeStatus, commentId);
      await this._decrementLikeCount(likeData.likeStatus, commentId);
    } catch (e) {
      return null;
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
