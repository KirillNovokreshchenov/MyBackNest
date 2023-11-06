// export class PostsSQLQueryRepository {
//   constructor(@InjectDataSource() protected dataSource: DataSource) {}
//
//   async findPost(
//     postId: IdType,
//     userId?: IdType,
//   ): Promise<PostViewModel | null> {
//     const extendedLikeInfo: ExtendedLikesInfo = await this._extendedLikeInfo(
//       postId,
//       userId,
//     );
//
//     const post = await this.dataSource.query(
//       `
//       SELECT post_id, blog_id as "blogId", b.name as "blogName", title, short_description as "shortDescription", content, p.created_at as "createdAt"
// FROM public.posts as p
// LEFT JOIN blogs b USING(blog_id)
//       `,
//     );
//     if (!post) return null;
//     return new PostSQLViewModel(post[0], extendedLikeInfo);
//   }
//
//   private async _extendedLikeInfo(postId: IdType, userId?: IdType) {
//     let myLikeStatus = await this._likeStatus(postId, userId);
//     if (!myLikeStatus) myLikeStatus = LIKE_STATUS.NONE;
//     const newestLikes = await this._newestLikes(postId);
//     let likeCount = await this.dataSource.query(
//       `
//            SELECT COUNT(*)
//            FROM public.posts_likes
//            WHERE post_id = $1 AND like_status = 'Like';
//             `,
//       [postId],
//     );
//     likeCount = +likeCount[0].count;
//     let dislikeCount = await this.dataSource.query(
//       `
//            SELECT COUNT(*)
//            FROM public.posts_likes
//            WHERE post_id = $1 AND like_status = 'Dislike';
//             `,
//       [postId],
//     );
//     dislikeCount = +dislikeCount[0].count;
//     return {
//       likesCount: likeCount,
//       dislikesCount: dislikeCount,
//       myStatus: myLikeStatus,
//       newestLikes: newestLikes,
//     };
//   }
//   async _newestLikes(postId: IdType) {
//     const newestLikes = await this.dataSource.query(
//       `
//       SELECT owner_id as "userId", created_at as "addedAt", login
// FROM public.posts_likes
// LEFT JOIN public.users ON owner_id = user_id
// WHERE post_id = $1 AND like_status = 'Like'
// ORDER BY "addedAt" DESC
// LIMIT 3;
//       `,
//       [postId],
//     );
//     return newestLikes;
//   }
//   async _likeStatus(postId: IdType, userId?: IdType) {
//     if (userId) {
//       let like = await this.dataSource.query(
//         `
//         SELECT like_status
//         FROM public.posts_likes
//         WHERE post_id = $1 AND owner_id = $2;
//         `,
//         [postId, userId],
//       );
//       like = like[0]?.like_status;
//       return like;
//     }
//   }
//   async findAllPost(dataQuery: QueryInputType, postFilter: PostFilterType) {
//     const query = new QueryModel(dataQuery);
//
//     const totalCount = await this._totalCount(postFilter.blogId);
//     const countPages = pagesCount(totalCount, query.pageSize);
//     const skip = skipPages(query.pageNumber, query.pageSize);
//     const allPosts = await this._getAllPosts(query, skip, postFilter.blogId);
//
//     const mapPosts = await Promise.all(
//       allPosts.map(async (post) => {
//         const extendedLikeInfo = await this._extendedLikeInfo(
//           post.post_id,
//           postFilter.userId,
//         );
//         return new PostSQLViewModel(post, extendedLikeInfo);
//       }),
//     );
//
//     return new PostViewModelAll(
//       countPages,
//       query.pageNumber,
//       query.pageSize,
//       totalCount,
//       mapPosts,
//     );
//   }
//
//   private async _getAllPosts(
//     dataQuery: QueryModel,
//     skip: number,
//     blogId?: IdType,
//   ) {
//     if (blogId) {
//       const allPostsForBlog = await this.dataSource.query(
//         `
//     SELECT post_id, blog_id as "blogId", b.name as "blogName", title, short_description as "shortDescription", content, p.created_at as "createdAt"
// FROM public.posts as p
// LEFT JOIN blogs b USING(blog_id)
// WHERE blog_id = $1 AND p.is_deleted <> true
// ORDER BY "${dataQuery.sortBy}" ${dataQuery.sortDirection}
// LIMIT $2 OFFSET $3
//     `,
//         [blogId, dataQuery.pageSize, skip],
//       );
//       return allPostsForBlog;
//     }
//     const allPosts = await this.dataSource.query(
//       `
//     SELECT post_id, blog_id as "blogId", b.name as "blogName", title, short_description as "shortDescription", content, p.created_at as "createdAt"
// FROM public.posts as p
// LEFT JOIN blogs b USING(blog_id)
// WHERE p.is_deleted <> true
// ORDER BY "${dataQuery.sortBy}" ${dataQuery.sortDirection}
// LIMIT $1 OFFSET $2
//     `,
//       [dataQuery.pageSize, skip],
//     );
//     return allPosts;
//   }
//
//   private async _totalCount(blogId?: IdType) {
//     if (blogId) {
//       let totalCount = await this.dataSource.query(
//         `
//            SELECT COUNT(*)
//            FROM public.posts
//            WHERE blog_id = $1 AND is_deleted <> true;
//             `,
//         [blogId],
//       );
//       totalCount = +totalCount[0].count;
//       return totalCount;
//     }
//     let totalCount = await this.dataSource.query(
//       `
//            SELECT COUNT(*)
//            FROM public.posts
//            WHERE is_deleted <> true;
//             `,
//     );
//     totalCount = +totalCount[0].count;
//     return totalCount;
//   }
// }
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IdType } from '../../models/IdType';
import {
  PostSQLViewModel,
  PostViewModel,
} from '../api/view-models/PostViewModel';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';
import { QueryInputType } from '../../models/QueryInputType';
import { PostFilterType } from './types/filter-query.types';
import { PostViewModelAll } from '../api/view-models/PostViewModelAll';
import { QueryModel } from '../../models/QueryModel';
import { pagesCount } from '../../helpers/pages-count';
import { skipPages } from '../../helpers/skip-pages';

export class PostsSQLQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findPost(
    postId: IdType,
    userId?: IdType,
  ): Promise<PostViewModel | RESPONSE_ERROR> {
    console.log(userId);
    const postRaw = await this.dataSource.query(
      `
        SELECT p."postId", p."title", p."shortDescription", p."content", p."createdAt", p."blogId", p."blogName",
         l."like_status", l."created_at" as "addedAt", l.login, l."owner_id" as "userId",
    (SELECT COUNT(*) FROM posts_likes WHERE "post_id" = p."postId" AND "like_status" = 'Like') as "likesCount",
    (SELECT COUNT(*) FROM posts_likes WHERE "post_id" = p."postId" AND "like_status" = 'Dislike') as "dislikesCount",
    (SELECT "like_status" FROM posts_likes WHERE "post_id" = p."postId" AND "owner_id" = $2) as "myStatus"
    FROM (
    SELECT post_id as "postId", title, short_description as "shortDescription", content, sa_p.created_at as "createdAt", sa_p.blog_id as "blogId", name as "blogName", sa_p.is_deleted
     FROM sa_posts sa_p
       LEFT JOIN public.sa_blogs USING (blog_id)
    	 ) as p
    LEFT JOIN (
        SELECT "like_id", "post_id", "like_status", pl."created_at", login, "owner_id"
        FROM posts_likes as pl
        LEFT JOIN public.users u ON "owner_id" = u."user_id"
        WHERE "like_id" IN (
            SELECT "like_id"
            FROM posts_likes
            WHERE "post_id" = pl."post_id" AND "like_status" = 'Like'
            ORDER BY "created_at" desc
            LIMIT 3
        )
        ORDER BY "created_at" desc
    ) l ON p."postId" = l."post_id"
    WHERE p."postId" = $1 AND p.is_deleted <> true
      `,
      [postId, userId ?? null],
    );
    if (!postRaw[0]) return RESPONSE_ERROR.NOT_FOUND;
    return (await this._mapPosts(postRaw))[0];
  }

  async findAllPost(
    dataQuery: QueryInputType,
    postFilter: PostFilterType,
  ): Promise<PostViewModelAll> {
    const query = new QueryModel(dataQuery);
    const skip = skipPages(query.pageNumber, query.pageSize);
    const allPostsRaw = await this.dataSource.query(
      `
        SELECT p."postId", p."title", p."shortDescription", p."content", p."createdAt", p."blogId", p."blogName",
         l."like_status", l."created_at" as "addedAt", l.login, l."owner_id" as "userId",
    (SELECT COUNT(*) FROM posts_likes WHERE "post_id" = p."postId" AND "like_status" = 'Like') as "likesCount",
    (SELECT COUNT(*) FROM posts_likes WHERE "post_id" = p."postId" AND "like_status" = 'Dislike') as "dislikesCount",
    (SELECT COUNT(*) FROM sa_posts WHERE blog_id = COALESCE($1, blog_id)) as "totalCount",
    (SELECT "like_status" FROM posts_likes WHERE "post_id" = p."postId" AND "owner_id" = $4) as "myStatus"
    FROM (
    SELECT post_id as "postId", title, short_description as "shortDescription", content, sa_p.created_at as "createdAt", sa_p.blog_id as "blogId", name as "blogName", sa_p.is_deleted
     FROM sa_posts sa_p
       LEFT JOIN public.sa_blogs USING (blog_id)
    	 WHERE sa_p.blog_id = COALESCE($1, sa_p.blog_id)
    	 ORDER BY "${query.sortBy}" ${query.sortDirection}
    	 LIMIT $2 OFFSET $3
    	 ) as p
    LEFT JOIN (
        SELECT "like_id", "post_id", "like_status", pl."created_at", login, "owner_id"
        FROM posts_likes as pl
        LEFT JOIN public.users u ON "owner_id" = u."user_id"
        WHERE "like_id" IN (
            SELECT "like_id"
            FROM posts_likes
            WHERE "post_id" = pl."post_id" AND "like_status" = 'Like'
            ORDER BY "created_at" desc
            LIMIT 3
        )
        ORDER BY "created_at" desc
    ) l ON p."postId" = l."post_id"
    WHERE p.is_deleted <> true
    ORDER BY "${query.sortBy}" ${query.sortDirection}

        `,
      [
        postFilter.blogId ?? null,
        query.pageSize,
        skip,
        postFilter.userId ?? null,
      ],
    );

    const mapPosts = await this._mapPosts(allPostsRaw);
    const totalCount = Number(allPostsRaw[0].totalCount) ?? 0;
    const countPages = pagesCount(totalCount, query.pageSize);

    return new PostViewModelAll(
      countPages,
      query.pageNumber,
      query.pageSize,
      totalCount,
      mapPosts,
    );
  }

  private async _mapPosts(postsRaw) {
    const mapPosts: PostSQLViewModel[] = [];
    const addedPosts = {};
    for (const postRaw of postsRaw) {
      let postWithLikes: PostViewModel = addedPosts[postRaw.postId];
      if (!postWithLikes) {
        postWithLikes = {
          id: postRaw.postId,
          title: postRaw.title,
          shortDescription: postRaw.shortDescription,
          content: postRaw.content,
          blogId: postRaw.blogId,
          blogName: postRaw.blogName,
          createdAt: postRaw.createdAt,
          extendedLikesInfo: {
            likesCount: Number(postRaw.likesCount),
            dislikesCount: Number(postRaw.dislikesCount),
            myStatus: postRaw.myStatus ?? LIKE_STATUS.NONE,
            newestLikes: [],
          },
        };
        mapPosts.push(postWithLikes);
        addedPosts[postRaw.postId] = postWithLikes;
      }

      if (postRaw.like_status) {
        postWithLikes.extendedLikesInfo.newestLikes.push({
          userId: postRaw.userId,
          login: postRaw.login,
          addedAt: postRaw.addedAt,
        });
      }
    }
    return mapPosts;
  }
}
