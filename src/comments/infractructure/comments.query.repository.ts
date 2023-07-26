import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comment.schema';
import { CommentViewModel } from '../api/view-models/CommentViewModel';
import { QueryInputType } from '../../models/QueryInputType';
import { QueryModel } from '../../models/QueryModel';
import { pagesCount } from '../../helpers/pages-count';
import { sortQuery } from '../../helpers/sort-query';
import { skipPages } from '../../helpers/skip-pages';
import { CommentViewModelAll } from '../api/view-models/CommentViewModelAll';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}
  async findComment(
    commentId: Types.ObjectId,
  ): Promise<CommentViewModel | null> {
    const comment: Comment | null = await this.CommentModel.findById(
      commentId,
    ).lean();

    if (!comment) return null;
    return new CommentViewModel(comment);
  }

  async findAllComments(
    dataQuery: QueryInputType,
    postId?: Types.ObjectId,
  ): Promise<CommentViewModelAll> {
    const query = new QueryModel(dataQuery);
    const filter: { postId?: Types.ObjectId } = {};
    if (postId) {
      filter.postId = postId;
    }

    const totalCount = await this.CommentModel.countDocuments(filter);
    const countPages = pagesCount(totalCount, query.pageSize);
    const sort = sortQuery(query.sortDirection, query.sortBy);
    const skip = skipPages(query.pageNumber, query.pageSize);

    const allComments = await this.CommentModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(query.pageSize)
      .lean();
    console.log(allComments);
    const mapComments = allComments.map(
      (comment) => new CommentViewModel(comment),
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
