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
import { ParseObjectIdPipe } from '../../pipes-global/parse-object-id-pipe.service';

@Controller('comments')
export class CommentsController {
  constructor(protected commentsQueryRepository: CommentsQueryRepository) {}
  @Get('/:id')
  async findCommentById(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ): Promise<CommentViewModel> {
    const comment = await this.commentsQueryRepository.findComment(id);
    if (!comment) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    return comment;
  }
}
