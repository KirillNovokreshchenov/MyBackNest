import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.schema';
import {
  CommentMongoViewModel,
  CommentSQLViewModel,
  CommentViewModel,
} from '../api/view-models/CommentViewModel';
import { QueryInputType } from '../../models/QueryInputType';
import { QueryModel } from '../../models/QueryModel';
import { pagesCount } from '../../helpers/pages-count';
import { sortQuery } from '../../helpers/sort-query';
import { skipPages } from '../../helpers/skip-pages';
import { CommentViewModelAll } from '../api/view-models/CommentViewModelAll';
import {
  CommentLike,
  CommentLikeModelType,
} from '../domain/comment-like.schema';
import { Blog, BlogModelType } from '../../blogs/domain/blog.schema';
import { Post, PostModelType } from '../../posts/domain/post.schema';
import { CommentForBlogViewModel } from '../api/view-models/CommentForBlogViewModel';
import { IdType } from '../../models/IdType';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {}
  async findComment(
    commentId: IdType,
    userId?: IdType,
  ): Promise<CommentViewModel | null> {
    const like = await this.CommentLikeModel.findOne({
      userId,
      commentId,
      isBanned: { $ne: true },
    }).lean();
    console.log(like);
    const comment: CommentDocument | null = await this.CommentModel.findOne({
      _id: commentId,
      isBanned: { $ne: true },
    }).lean();

    if (!comment) return null;
    return new CommentMongoViewModel(comment, like?.likeStatus);
  }
  async findAllCommentsForBlogs(dataQuery: QueryInputType, userId: IdType) {
    const query = new QueryModel(dataQuery);
    const totalCount = await this.CommentModel.countDocuments({
      ownerBlogId: userId,
      isBanned: { $ne: true },
    });
    const countPages = pagesCount(totalCount, query.pageSize);
    const sort = sortQuery(query.sortDirection, query.sortBy);
    const skip = skipPages(query.pageNumber, query.pageSize);
    const allComments = await this.CommentModel.find({
      ownerBlogId: userId,
      isBanned: { $ne: true },
    })
      .sort(sort)
      .skip(skip)
      .limit(query.pageSize)
      .lean();

    const mapComments = await Promise.all(
      allComments.map(async (comment) => {
        const commentId = comment._id;
        const like = await this.CommentLikeModel.findOne({
          userId,
          commentId,
          isBanned: { $ne: true },
        }).lean();
        return new CommentForBlogViewModel(comment, like?.likeStatus);
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

  async findAllComments(
    dataQuery: QueryInputType,
    postId: IdType,
    userId?: IdType,
  ): Promise<CommentViewModelAll> {
    const query = new QueryModel(dataQuery);

    const totalCount = await this.CommentModel.countDocuments({
      'postInfo.id': postId,
      isBanned: { $ne: true },
    });
    const countPages = pagesCount(totalCount, query.pageSize);
    const sort = sortQuery(query.sortDirection, query.sortBy);
    const skip = skipPages(query.pageNumber, query.pageSize);

    const allComments = await this.CommentModel.find({
      'postInfo.id': postId,
      isBanned: { $ne: true },
    })
      .sort(sort)
      .skip(skip)
      .limit(query.pageSize)
      .lean();

    const mapComments = await Promise.all(
      allComments.map(async (comment) => {
        const commentId = comment._id;
        const like = await this.CommentLikeModel.findOne({
          userId,
          commentId,
          isBanned: { $ne: true },
        }).lean();
        return new CommentMongoViewModel(comment, like?.likeStatus);
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
}

export class CommentsSQLQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findComment(
    commentId: IdType,
    userId?: IdType,
  ): Promise<CommentViewModel | null> {
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
    if (!comment[0]) return null;
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
