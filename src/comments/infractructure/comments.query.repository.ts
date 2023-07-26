import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comment.schema';
import { CommentViewModel } from '../api/view-models/CommentViewModel';

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

  // async findAllComments() {}
}
