import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';
import { Post } from '../domain/entities-typeorm/post.entity';
import { PostLike } from '../domain/entities-typeorm/post-like.entity';
import { PostTypeORMViewModel } from '../api/view-models/PostTypeORMViewModel';
import { NewestLikes } from '../api/view-models/NewestLikeModel';
import { QueryModel } from '../../models/QueryModel';
import { QueryInputType } from '../../models/QueryInputType';
import { PostFilterType } from './types/filter-query.types';
import { PostViewModelAll } from '../api/view-models/PostViewModelAll';
import { pagesCount } from '../../helpers/pages-count';
import { skipPages } from '../../helpers/skip-pages';
import {
  PostSQLViewModel,
  PostViewModel,
} from '../api/view-models/PostViewModel';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';

export class PostsTypeORMQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Post) protected postsRepo: Repository<Post>,
    @InjectRepository(PostLike) protected postLikesRepo: Repository<PostLike>,
  ) {}
  // Promise<PostViewModel | RESPONSE_ERROR>
  async findPost(postId: string, userId?: string) {
    const rawPost = await this.dataSource
      .createQueryBuilder()
      .select('"p".*')
      .from((subQuery) => {
        return subQuery
          .from('post', 'p')
          .where('"postId" = :postId', { postId: postId })
          .andWhere('"isDeleted" <> true');
      }, 'p')
      .addSelect((sq) => {
        return sq
          .select('count(*)', 'likesCount')
          .from('post_like', 'pl')
          .where("pl.likeStatus = 'Like'")
          .andWhere('"pl"."postId" = "p"."postId"');
      })
      .addSelect((sq) => {
        return sq
          .select('count(*)', 'dislikesCount')
          .from('post_like', 'pl')
          .where("pl.likeStatus = 'Dislike'")
          .andWhere('pl."postId" = "p"."postId"');
      })
      .addSelect((sq) => {
        return sq
          .select('pl.likeStatus', 'myStatus')
          .from('post_like', 'pl')
          .where('"pl"."postId" = "p"."postId"')
          .andWhere('"pl"."ownerId" = :ownerId', {
            ownerId: userId,
          });
      })
      .addSelect('name')
      .leftJoin('blog', 'b', '"b"."blogId" = "p"."blogId"')
      .leftJoinAndSelect(
        (sq) => {
          return sq
            .select(
              '"postId", "pl"."createdAt" as "addedAt", "likeId", "likeStatus", "login", "ownerId" as "userId"',
            )
            .from('post_like', 'pl')
            .leftJoin('pl.user', 'u')
            .where((qb) => {
              const subQuery = qb
                .subQuery()
                .select('l.likeId')
                .from('post_like', 'l')
                .where("l.likeStatus = 'Like'")
                .andWhere('l.postId = pl.postId')
                .orderBy({ 'l.createdAt': 'DESC' })
                .limit(3)
                .getQuery();
              return 'pl.likeId IN ' + subQuery;
            });
        },
        'nl',
        '"nl"."postId" = "p"."postId"',
      )
      .getRawMany();
    if (!rawPost[0]) return RESPONSE_ERROR.NOT_FOUND;
    return this._mapPosts(rawPost)[0];
  }
  private _mapPosts(postsRaw) {
    const mapPosts: PostViewModel[] = [];
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
          blogName: postRaw.name,
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

      if (postRaw.likeStatus) {
        postWithLikes.extendedLikesInfo.newestLikes.unshift({
          userId: postRaw.userId,
          login: postRaw.login,
          addedAt: postRaw.addedAt,
        });
      }
    }
    return mapPosts;
  }

  async findAllPost(
    dataQuery: QueryInputType,
    postFilter: PostFilterType,
  ): Promise<any> {
    const query = new QueryModel(dataQuery);
    const skip = skipPages(query.pageNumber, query.pageSize);
    const rawPosts = await this.postsRepo
      .createQueryBuilder()
      .select('"p".*')
      .from((subQuery) => {
        return subQuery
          .from('post', 'p')
          .where('"p"."blogId" = COALESCE(:blogId, "p"."blogId")', {
            blogId: postFilter.blogId,
          })
          .orderBy({
            ['"p".' + `"` + `${query.sortBy}` + `"`]:
              query.sortDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
          })
          .andWhere('"isDeleted" <> true')
          .skip(skip)
          .take(query.pageSize);
      }, 'p')
      .addSelect((sq) => {
        return sq
          .select('count(*)', 'totalCount')
          .from('post', 'p')
          .where('"p"."blogId" = COALESCE(:blogId, "p"."blogId")', {
            blogId: postFilter.blogId,
          });
      })
      .addSelect((sq) => {
        return sq
          .select('count(*)', 'likesCount')
          .from('post_like', 'pl')
          .where("pl.likeStatus = 'Like'")
          .andWhere('"pl"."postId" = "p"."postId"');
      })
      .addSelect((sq) => {
        return sq
          .select('count(*)', 'dislikesCount')
          .from('post_like', 'pl')
          .where("pl.likeStatus = 'Dislike'")
          .andWhere('pl."postId" = "p"."postId"');
      })
      .addSelect((sq) => {
        return sq
          .select('pl.likeStatus', 'myStatus')
          .from('post_like', 'pl')
          .where('"pl"."postId" = "p"."postId"')
          .andWhere('"pl"."ownerId" = :ownerId', {
            ownerId: postFilter.userId,
          });
      })
      .addSelect('name')
      .leftJoin('blog', 'b', '"b"."blogId" = "p"."blogId"')
      .leftJoinAndSelect(
        (sq) => {
          return sq
            .select(
              '"postId", "pl"."createdAt" as "addedAt", "likeId", "likeStatus", "login", "ownerId" as "userId"',
            )
            .from('post_like', 'pl')
            .leftJoin('pl.user', 'u')
            .where((qb) => {
              const subQuery = qb
                .subQuery()
                .select('l.likeId')
                .from('post_like', 'l')
                .where("l.likeStatus = 'Like'")
                .andWhere('l.postId = pl.postId')
                .orderBy({ 'l.createdAt': 'DESC' })
                .limit(3)
                .getQuery();
              return 'pl.likeId IN ' + subQuery;
            });
        },
        'nl',
        '"nl"."postId" = "p"."postId"',
      )
      .where('"p"."blogId" = COALESCE(:blogId, "p"."blogId")', {
        blogId: postFilter.blogId,
      })
      .orderBy({
        ['"p".' + `"` + `${query.sortBy}` + `"`]:
          query.sortDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
      })
      .getRawMany();
    const mapPosts = this._mapPosts(rawPosts);
    const totalCount = Number(rawPosts[0].totalCount) ?? 0;
    const countPages = pagesCount(totalCount, query.pageSize);

    return new PostViewModelAll(
      countPages,
      query.pageNumber,
      query.pageSize,
      totalCount,
      mapPosts,
    );
  }
}
