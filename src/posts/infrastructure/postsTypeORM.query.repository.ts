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

// export class PostsTypeORMQueryRepository {
//   constructor(
//     @InjectDataSource() protected dataSource: DataSource,
//     @InjectRepository(Post) protected postsRepo: Repository<Post>,
//     @InjectRepository(PostLike) protected postLikesRepo: Repository<PostLike>,
//   ) {}
//
//   async findPost(
//     postId: string,
//     userId?: string,
//   ): Promise<PostViewModel | RESPONSE_ERROR> {
//     const post: PostTypeORMViewType | null = await this.postsRepo.findOne({
//       relations: { blog: true },
//       select: { blog: { name: true } },
//       where: { postId: postId, isDeleted: false },
//     });
//     if (!post) return RESPONSE_ERROR.NOT_FOUND;
//     const newestLikes = await this._newestLikes(postId);
//     const myLikeStatus = await this._likeStatus(postId, userId);
//     return new PostTypeORMViewModel(post, newestLikes, myLikeStatus);
//   }
//
//   async findAllPost(
//     dataQuery: QueryInputType,
//     postFilter: PostFilterType,
//   ): Promise<any> {
//     const query = new QueryModel(dataQuery);
//     let condition = {};
//     if (postFilter.blogId) {
//       condition = { blogId: postFilter.blogId };
//     }
//     const skip = skipPages(query.pageNumber, query.pageSize);
//     const [allPosts, totalCount] = await this.postsRepo.findAndCount({
//       relations: { blog: true },
//       select: { blog: { name: true } },
//       order: {
//         [query.sortBy]: query.sortDirection,
//       },
//       where: condition,
//       skip: skip,
//       take: query.pageSize,
//     });
//     const countPages = pagesCount(totalCount, query.pageSize);
//
//     const mapPosts = await Promise.all(
//       allPosts.map(async (post) => {
//         const newestLikes = await this._newestLikes(post.postId);
//         const myLikeStatus = await this._likeStatus(
//           post.postId,
//           postFilter.userId as string,
//         );
//         return new PostTypeORMViewModel(post, newestLikes, myLikeStatus);
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
//   async _newestLikes(postId: string): Promise<NewestLikes[]> {
//     const newestLikes = await this.postLikesRepo.find({
//       relations: { user: true },
//       select: { user: { login: true } },
//       where: { postId: postId, likeStatus: LIKE_STATUS.LIKE },
//       order: { createdAt: 'DESC' },
//       take: 3,
//     });
//     return newestLikes.map((like) => {
//       return {
//         userId: like.ownerId,
//         login: like.user.login,
//         addedAt: like.createdAt,
//       };
//     });
//   }
//
//   async _likeStatus(postId: string, userId?: string) {
//     if (userId) {
//       const like = await this.postLikesRepo.findOne({
//         where: { postId: postId, ownerId: userId },
//       });
//       return like?.likeStatus;
//     }
//   }
// }

export class PostsTypeORMQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Post) protected postsRepo: Repository<Post>,
    @InjectRepository(PostLike) protected postLikesRepo: Repository<PostLike>,
  ) {}
  // Promise<PostViewModel | RESPONSE_ERROR>
  async findPost(postId: string, userId?: string) {
    const post = this.postsRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.postLikes', 'pl')
      .getMany();
    return post;
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

  async findAllPost(
    dataQuery: QueryInputType,
    postFilter: PostFilterType,
  ): Promise<any> {
    const query = new QueryModel(dataQuery);
    let condition = {};
    if (postFilter.blogId) {
      condition = { blogId: postFilter.blogId };
    }
    const skip = skipPages(query.pageNumber, query.pageSize);
    const [allPosts, totalCount] = await this.postsRepo.findAndCount({
      relations: { blog: true },
      select: { blog: { name: true } },
      order: {
        [query.sortBy]: query.sortDirection,
      },
      where: condition,
      skip: skip,
      take: query.pageSize,
    });
    const countPages = pagesCount(totalCount, query.pageSize);

    const mapPosts = await Promise.all(
      allPosts.map(async (post) => {
        const newestLikes = await this._newestLikes(post.postId);
        const myLikeStatus = await this._likeStatus(
          post.postId,
          postFilter.userId as string,
        );
        return new PostTypeORMViewModel(post, newestLikes, myLikeStatus);
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
  async _newestLikes(postId: string): Promise<NewestLikes[]> {
    const newestLikes = await this.postLikesRepo.find({
      relations: { user: true },
      select: { user: { login: true } },
      where: { postId: postId, likeStatus: LIKE_STATUS.LIKE },
      order: { createdAt: 'DESC' },
      take: 3,
    });
    return newestLikes.map((like) => {
      return {
        userId: like.ownerId,
        login: like.user.login,
        addedAt: like.createdAt,
      };
    });
  }

  async _likeStatus(postId: string, userId?: string) {
    if (userId) {
      const like = await this.postLikesRepo.findOne({
        where: { postId: postId, ownerId: userId },
      });
      return like?.likeStatus;
    }
  }
}
