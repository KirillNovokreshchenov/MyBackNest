import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { CommentsQueryRepository } from '../infractructure/comments.query.repository';
import { Types } from 'mongoose';
import { CommentViewModel } from './view-models/CommentViewModel';

@Controller('comments')
export class CommentsController {
  constructor(protected commentsQueryRepository: CommentsQueryRepository) {}
  @Get('/:id')
  async findCommentById(@Param('id') id: string): Promise<CommentViewModel> {
    const comment = await this.commentsQueryRepository.findComment(
      new Types.ObjectId(id),
    );
    if (!comment) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    return comment;
  }
}
