import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.schema';
import { PostViewModel } from '../api/view-models/PostViewModel';
import { QueryModel } from '../../models/QueryModel';
import { QueryInputType } from '../../models/QueryInputType';
import { pagesCount } from '../../helpers/pages-count';
import { sortQuery } from '../../helpers/sort-query';
import { skipPages } from '../../helpers/skip-pages';
import { PostViewModelAll } from '../api/view-models/PostViewModelAll';
import { PostFilterType } from './types/filter-query.types';
import { PostLike, PostLikeModelType } from '../domain/post-like.schema';
import { NewestLikes } from '../api/view-models/NewestLikeModel';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
  ) {}
  async findPost(
    postId: Types.ObjectId,
    userId?: Types.ObjectId,
  ): Promise<PostViewModel | null> {
    const newestLikes = await this._newestLikes(postId);
    const like = await this.PostLikeModel.findOne({
      userId,
      postId,
    }).lean();
    const post: Post | null = await this.PostModel.findById(postId).lean();
    if (!post) return null;
    return new PostViewModel(post, newestLikes, like?.likeStatus);
  }

  async findAllPost(dataQuery: QueryInputType, postFilter: PostFilterType) {
    const query = new QueryModel(dataQuery);

    const filter: { blogId?: Types.ObjectId } = {};
    if (postFilter.blogId) {
      filter.blogId = postFilter.blogId;
    }

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
        }).lean();
        return new PostViewModel(post, newestLikes, like?.likeStatus);
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
  async _newestLikes(postId: Types.ObjectId) {
    const newestLikes = await this.PostLikeModel.find({ postId })
      .sort({ addedAt: -1 })
      .limit(3)
      .lean();
    return newestLikes.map((like) => new NewestLikes(like));
  }
}
