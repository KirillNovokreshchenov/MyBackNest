import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IdType } from '../../models/IdType';
import {
  CommentSQLViewModel,
  CommentViewModel,
} from '../api/view-models/CommentViewModel';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';
import { QueryInputType } from '../../models/QueryInputType';
import { CommentViewModelAll } from '../api/view-models/CommentViewModelAll';
import { QueryModel } from '../../models/QueryModel';
import { pagesCount } from '../../helpers/pages-count';
import { skipPages } from '../../helpers/skip-pages';

export class CommentsSQLQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findComment(
    commentId: IdType,
    userId?: IdType,
  ): Promise<CommentViewModel | RESPONSE_ERROR> {
    const comment = await this.dataSource.query(
      `
  SELECT comment_id, owner_id as "userId", login as "userLogin", content, created_at as "createdAt", like_count, dislike_count
  FROM public.comments as c
  LEFT JOIN users ON owner_id = user_id
  WHERE comment_id = $1 AND c.is_deleted <> true
  ;
  `,
      [commentId],
    );
    if (!comment[0]) return RESPONSE_ERROR.NOT_FOUND;
    let myLikeStatus = await this._likeStatus(commentId, userId);
    if (!myLikeStatus) myLikeStatus = LIKE_STATUS.NONE;
    return new CommentSQLViewModel(comment[0], myLikeStatus);
  }

  async findAllComments(
    dataQuery: QueryInputType,
    postId: IdType,
    userId?: IdType,
  ): Promise<CommentViewModelAll> {
    const query = new QueryModel(dataQuery);

    let totalCount = await this.dataSource.query(
      `
           SELECT COUNT(*)
           FROM public.comments
           WHERE post_id = $1 AND is_deleted <> true;
            `,
      [postId],
    );
    totalCount = +totalCount[0].count;
    const countPages = pagesCount(totalCount, query.pageSize);
    const skip = skipPages(query.pageNumber, query.pageSize);

    const comments = await this.dataSource.query(
      `
  SELECT comment_id, owner_id as "userId", login as "userLogin", content, created_at as "createdAt", like_count, dislike_count
  FROM public.comments as c
  LEFT JOIN users ON owner_id = user_id
  WHERE post_id = $1 AND c.is_deleted <> true
  ORDER BY "${query.sortBy}" ${query.sortDirection}
LIMIT $2 OFFSET $3;
  `,
      [postId, query.pageSize, skip],
    );
    const mapComments = await Promise.all(
      comments.map(async (comment) => {
        let myLikeStatus = await this._likeStatus(comment.comment_id, userId);
        if (!myLikeStatus) myLikeStatus = LIKE_STATUS.NONE;
        return new CommentSQLViewModel(comment, myLikeStatus);
      }),
    );

    return new CommentViewModelAll(
      countPages,
      query.pageNumber,
      query.pageSize,
      totalCount,
      mapComments,
    );
  }

  async _likeStatus(commentId: IdType, userId?: IdType) {
    if (userId) {
      let like = await this.dataSource.query(
        `
        SELECT like_status
        FROM public.comments_likes
        WHERE comment_id = $1 AND owner_id = $2;
        `,
        [commentId, userId],
      );
      like = like[0]?.like_status;
      return like;
    }
  }
}
