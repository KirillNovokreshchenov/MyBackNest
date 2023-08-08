import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
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

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
  ) {}
  async findComment(
    commentId: Types.ObjectId,
    userId?: Types.ObjectId,
  ): Promise<CommentViewModel | null> {
    const like = await this.CommentLikeModel.findOne({
      userId,
      commentId,
    }).lean();
    console.log(like);
    const comment: CommentDocument | null = await this.CommentModel.findById(
      commentId,
    ).lean();

    if (!comment) return null;
    return new CommentViewModel(comment, like?.likeStatus);
  }

  async findAllComments(
    dataQuery: QueryInputType,
    postId: Types.ObjectId,
    userId?: Types.ObjectId,
  ): Promise<CommentViewModelAll> {
    const query = new QueryModel(dataQuery);

    const totalCount = await this.CommentModel.countDocuments({ postId });
    const countPages = pagesCount(totalCount, query.pageSize);
    const sort = sortQuery(query.sortDirection, query.sortBy);
    const skip = skipPages(query.pageNumber, query.pageSize);

    const allComments = await this.CommentModel.find({ postId })
      .sort(sort)
      .skip(skip)
      .limit(query.pageSize)
      .lean();

    const mapComments = allComments.map(async (comment) => {
      const commentId = comment._id;
      const like = await this.CommentLikeModel.findOne({
        userId,
        commentId,
      }).lean();
      return new CommentViewModel(comment, like?.likeStatus);
    });

    const mapComment = await Promise.all(mapComments);

    return new CommentViewModelAll(
      countPages,
      query.pageNumber,
      query.pageSize,
      totalCount,
      mapComment,
    );
  }
}
