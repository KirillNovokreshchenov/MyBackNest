import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.schema';
import {
  ExtendedLikesInfo,
  PostMongoViewModel,
  PostSQLViewModel,
  PostViewModel,
} from '../api/view-models/PostViewModel';
import { QueryModel } from '../../models/QueryModel';
import { QueryInputType } from '../../models/QueryInputType';
import { pagesCount } from '../../helpers/pages-count';
import { sortQuery } from '../../helpers/sort-query';
import { skipPages } from '../../helpers/skip-pages';
import { PostViewModelAll } from '../api/view-models/PostViewModelAll';
import { PostFilterType } from './types/filter-query.types';
import { PostLike, PostLikeModelType } from '../domain/post-like.schema';
import { NewestLikes } from '../api/view-models/NewestLikeModel';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';
import { IdType } from '../../models/IdType';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
  ) {}
  async findPost(
    postId: IdType,
    userId?: IdType,
  ): Promise<PostViewModel | null> {
    const newestLikes = await this._newestLikes(postId);
    const like = await this.PostLikeModel.findOne({
      userId,
      postId,
      isBanned: { $ne: true },
    }).lean();
    const post: Post | null = await this.PostModel.findOne({
      _id: postId,
      isBanned: { $ne: true },
    }).lean();
    if (!post) return null;
    return new PostMongoViewModel(post, newestLikes, like?.likeStatus);
  }

  async findAllPost(dataQuery: QueryInputType, postFilter: PostFilterType) {
    const query = new QueryModel(dataQuery);

    const filter: { blogId?: IdType; isBanned?: any } = {};
    if (postFilter.blogId) {
      filter.blogId = postFilter.blogId;
    }
    filter.isBanned = { $ne: true };

    const totalCount = await this.PostModel.countDocuments(filter);
    const countPages = pagesCount(totalCount, query.pageSize);
    const sort = sortQuery(query.sortDirection, query.sortBy);
    const skip = skipPages(query.pageNumber, query.pageSize);

    const allPosts = await this.PostModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(query.pageSize)
      .lean();

    const mapPosts = await Promise.all(
      allPosts.map(async (post) => {
        const newestLikes = await this._newestLikes(post._id);
        const like = await this.PostLikeModel.findOne({
          userId: postFilter.userId,
          postId: post._id,
          isBanned: { $ne: true },
        }).lean();
        return new PostMongoViewModel(post, newestLikes, like?.likeStatus);
      }),
    );

    return new PostViewModelAll(
      countPages,
      query.pageNumber,
      query.pageSize,
      totalCount,
      mapPosts,
    );
  }
  async _newestLikes(postId: IdType) {
    const newestLikes = await this.PostLikeModel.find({
      postId,
      likeStatus: LIKE_STATUS.LIKE,
      isBanned: { $ne: true },
    })
      .sort({ addedAt: -1 })
      .limit(3)
      .lean();
    return newestLikes.map((like) => new NewestLikes(like));
  }
}

export class PostsSQLQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findPost(
    postId: IdType,
    userId?: IdType,
  ): Promise<PostViewModel | null> {
    const extendedLikeInfo: ExtendedLikesInfo = await this._extendedLikeInfo(
      postId,
      userId,
    );

    const post = await this.dataSource.query(
      `
      SELECT post_id, blog_id as "blogId", b.name as "blogName", title, short_description as "shortDescription", content, p.created_at as "createdAt"
FROM public.posts as p
LEFT JOIN blogs b USING(blog_id)
      `,
    );
    if (!post) return null;
    return new PostSQLViewModel(post[0], extendedLikeInfo);
  }

  private async _extendedLikeInfo(postId: IdType, userId?: IdType) {
    let myLikeStatus = await this._likeStatus(postId, userId);
    if (!myLikeStatus) myLikeStatus = LIKE_STATUS.NONE;
    const newestLikes = await this._newestLikes(postId);
    let likeCount = await this.dataSource.query(
      `
           SELECT COUNT(*)
           FROM public.posts_likes
           WHERE post_id = $1 AND like_status = 'Like';
            `,
      [postId],
    );
    likeCount = +likeCount[0].count;
    let dislikeCount = await this.dataSource.query(
      `
           SELECT COUNT(*)
           FROM public.posts_likes
           WHERE post_id = $1 AND like_status = 'Dislike';
            `,
      [postId],
    );
    dislikeCount = +dislikeCount[0].count;
    return {
      likesCount: likeCount,
      dislikesCount: dislikeCount,
      myStatus: myLikeStatus,
      newestLikes: newestLikes,
    };
  }
  async _newestLikes(postId: IdType) {
    const newestLikes = await this.dataSource.query(
      `
      SELECT owner_id as "userId", created_at as "addedAt", login
FROM public.posts_likes
LEFT JOIN public.users ON owner_id = user_id
WHERE post_id = $1 AND like_status = 'Like'
ORDER BY "addedAt" DESC
LIMIT 3;
      `,
      [postId],
    );
    return newestLikes;
  }
  async _likeStatus(postId: IdType, userId?: IdType) {
    if (userId) {
      let like = await this.dataSource.query(
        `
        SELECT like_status
        FROM public.posts_likes
        WHERE post_id = $1 AND owner_id = $2;
        `,
        [postId, userId],
      );
      like = like[0]?.like_status;
      return like;
    }
  }
  async findAllPost(dataQuery: QueryInputType, postFilter: PostFilterType) {
    const query = new QueryModel(dataQuery);

    const totalCount = await this._totalCount(postFilter.blogId);
    const countPages = pagesCount(totalCount, query.pageSize);
    const skip = skipPages(query.pageNumber, query.pageSize);
    const allPosts = await this._getAllPosts(query, skip, postFilter.blogId);

    const mapPosts = await Promise.all(
      allPosts.map(async (post) => {
        const extendedLikeInfo = await this._extendedLikeInfo(
          post.post_id,
          postFilter.userId,
        );
        return new PostSQLViewModel(post, extendedLikeInfo);
      }),
    );

    return new PostViewModelAll(
      countPages,
      query.pageNumber,
      query.pageSize,
      totalCount,
      mapPosts,
    );
  }

  private async _getAllPosts(
    dataQuery: QueryModel,
    skip: number,
    blogId?: IdType,
  ) {
    if (blogId) {
      const allPostsForBlog = await this.dataSource.query(
        `
    SELECT post_id, blog_id as "blogId", b.name as "blogName", title, short_description as "shortDescription", content, p.created_at as "createdAt"
FROM public.posts as p
LEFT JOIN blogs b USING(blog_id)
WHERE blog_id = $1 AND p.is_deleted <> true
ORDER BY "${dataQuery.sortBy}" ${dataQuery.sortDirection}
LIMIT $2 OFFSET $3
    `,
        [blogId, dataQuery.pageSize, skip],
      );
      return allPostsForBlog;
    }
    const allPosts = await this.dataSource.query(
      `
    SELECT post_id, blog_id as "blogId", b.name as "blogName", title, short_description as "shortDescription", content, p.created_at as "createdAt"
FROM public.posts as p
LEFT JOIN blogs b USING(blog_id)
WHERE p.is_deleted <> true
ORDER BY "${dataQuery.sortBy}" ${dataQuery.sortDirection}
LIMIT $1 OFFSET $2
    `,
      [dataQuery.pageSize, skip],
    );
    return allPosts;
  }

  private async _totalCount(blogId?: IdType) {
    if (blogId) {
      let totalCount = await this.dataSource.query(
        `
           SELECT COUNT(*)
           FROM public.posts
           WHERE blog_id = $1 AND is_deleted <> true;
            `,
        [blogId],
      );
      totalCount = +totalCount[0].count;
      return totalCount;
    }
    let totalCount = await this.dataSource.query(
      `
           SELECT COUNT(*)
           FROM public.posts
           WHERE is_deleted <> true;
            `,
    );
    totalCount = +totalCount[0].count;
    return totalCount;
  }
}
