import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IdType } from '../../models/IdType';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { LikeStatusBLType } from '../../models/LikeStatusBLType';
import { CreateCommentDto } from '../application/dto/CreateCommentDto';
import { UpdateCommentDto } from '../application/dto/UpdateCommentDto';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';

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
