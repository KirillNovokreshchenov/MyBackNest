import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { IdType } from '../../models/IdType';
import { QueryInputType } from '../../models/QueryInputType';
import { CommentViewModelAll } from '../api/view-models/CommentViewModelAll';
import { QueryModel } from '../../models/QueryModel';
import { skipPages } from '../../helpers/skip-pages';
import { Comment } from '../domain/entities-typeorm/comment.entity';
import { CommentLike } from '../domain/entities-typeorm/comment-like.entity';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';
import { pagesCount } from '../../helpers/pages-count';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import {
  CommentTypeORMViewModel,
  CommentViewModel,
} from '../api/view-models/CommentViewModel';

export class CommentsTypeORMQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Comment) protected commentsRepo: Repository<Comment>,
    @InjectRepository(CommentLike)
    protected commentLikesRepo: Repository<CommentLike>,
  ) {}
  // : Promise<CommentViewModel | RESPONSE_ERROR>
  async findComment(commentId: string, userId?: string) {
    const rawComment = await this.commentsRepo
      .createQueryBuilder('c')
      .select('content, "ownerId" as "userId", "commentId", "c"."createdAt"')
      .addSelect((sq) => {
        return sq
          .select('count(*)', 'likesCount')
          .from('comment_like', 'cl')
          .where("cl.likeStatus = 'Like'")
          .andWhere('cl."commentId" = "c"."commentId"');
      })
      .addSelect((sq) => {
        return sq
          .select('count(*)', 'dislikesCount')
          .from('comment_like', 'cl')
          .where("cl.likeStatus = 'Dislike'")
          .andWhere('cl."commentId" = "c"."commentId"');
      })
      .addSelect((sq) => {
        return sq
          .select('cl.likeStatus', 'myStatus')
          .from('comment_like', 'cl')
          .where('cl."commentId" = "c"."commentId"')
          .andWhere('"cl"."ownerId" = :ownerId', {
            ownerId: userId,
          });
      })
      .addSelect('login')
      .leftJoin('user', 'u', 'c.ownerId = u.userId')
      .where('"c"."commentId" = :commentId', {
        commentId: commentId,
      })
      .andWhere('"c"."isDeleted" <> true')
      .getRawOne();
    if (!rawComment) return RESPONSE_ERROR.NOT_FOUND;
    return new CommentTypeORMViewModel(rawComment);
  }

  async findAllComments(
    dataQuery: QueryInputType,
    postId: string,
    userId?: string,
  ): Promise<CommentViewModelAll> {
    const query = new QueryModel(dataQuery);
    const skip = skipPages(query.pageNumber, query.pageSize);
    const rawComments = await this.commentsRepo
      .createQueryBuilder('c')
      .select('content, "ownerId" as "userId", "commentId", "c"."createdAt"')
      .addSelect((sq) => {
        return sq
          .select('count(*)', 'totalCount')
          .from('comment', 'c')
          .where('"c"."postId" = :postId', {
            postId: postId,
          });
      })
      .addSelect((sq) => {
        return sq
          .select('count(*)', 'likesCount')
          .from('comment_like', 'cl')
          .where("cl.likeStatus = 'Like'")
          .andWhere('cl."commentId" = "c"."commentId"');
      })
      .addSelect((sq) => {
        return sq
          .select('count(*)', 'dislikesCount')
          .from('comment_like', 'cl')
          .where("cl.likeStatus = 'Dislike'")
          .andWhere('cl."commentId" = "c"."commentId"');
      })
      .addSelect((sq) => {
        return sq
          .select('cl.likeStatus', 'myStatus')
          .from('comment_like', 'cl')
          .where('cl."commentId" = "c"."commentId"')
          .andWhere('"cl"."ownerId" = :ownerId', {
            ownerId: userId,
          });
      })
      .addSelect('login')
      .leftJoin('user', 'u', 'c.ownerId = u.userId')
      .where('"c"."postId" = :postId', {
        postId: postId,
      })
      .andWhere('"c"."isDeleted" <> true')
      .orderBy({
        ['"c".' + `"` + `${query.sortBy}` + `"`]:
          query.sortDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
      })
      .limit(query.pageSize)
      .offset(skip)
      .getRawMany();
    const mapComments = this._mapComments(rawComments);
    const totalCount = Number(rawComments[0].totalCount) ?? 0;
    const countPages = pagesCount(totalCount, query.pageSize);
    return new CommentViewModelAll(
      countPages,
      query.pageNumber,
      query.pageSize,
      totalCount,
      mapComments,
    );
  }

  private _mapComments(rawComments) {
    return rawComments.map((comment) => {
      return new CommentTypeORMViewModel(comment);
    });
  }
}
