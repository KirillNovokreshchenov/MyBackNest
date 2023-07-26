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

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}
  async findPost(postId: Types.ObjectId): Promise<PostViewModel | null> {
    const post: Post | null = await this.PostModel.findById(postId).lean();
    if (!post) return null;
    return new PostViewModel(post);
  }

  async findAllPost(dataQuery: QueryInputType, blogId?: Types.ObjectId) {
    const query = new QueryModel(dataQuery);

    const filter: { blogId?: Types.ObjectId } = {};
    if (blogId) {
      filter.blogId = blogId;
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

    const mapPosts = allPosts.map((post) => new PostViewModel(post));

    return new PostViewModelAll(
      countPages,
      query.pageNumber,
      query.pageSize,
      totalCount,
      mapPosts,
    );
  }
}
