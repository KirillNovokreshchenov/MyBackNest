import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.schema';
import { CommentViewModel } from '../api/view-models/CommentViewModel';
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
    return new CommentViewModel(comment, like?.likeStatus);
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
        return new CommentViewModel(comment, like?.likeStatus);
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
