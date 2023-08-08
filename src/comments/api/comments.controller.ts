import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from '../infractructure/comments.query.repository';
import { Types } from 'mongoose';
import { CommentViewModel } from './view-models/CommentViewModel';
import { ParseObjectIdPipe } from '../../pipes-global/parse-object-id-pipe.service';
import { UpdateCommentDto } from '../application/dto/UpdateCommentDto';
import { CommentService } from '../application/comment.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/decorators/create-param-current-id.decarator';
import { RESPONSE_OPTIONS } from '../../models/ResponseOptionsEnum';
import { LikeStatusDto } from '../../models/LikeStatusDto';
import { JwtLikeAuthGuard } from '../../auth/guards/jwt-like-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(
    protected commentsQueryRepository: CommentsQueryRepository,
    protected commentService: CommentService,
  ) {}
  @UseGuards(JwtLikeAuthGuard)
  @Get('/:id')
  async findCommentById(
    @Param('id', ParseObjectIdPipe) commentId: Types.ObjectId,
    @CurrentUserId() userId?: Types.ObjectId,
  ): Promise<CommentViewModel> {
    const comment = await this.commentsQueryRepository.findComment(
      commentId,
      userId,
    );
    if (!comment) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    return comment;
  }
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async updateComment(
    @Param('id', ParseObjectIdPipe) commentId: Types.ObjectId,
    @Body() commentDto: UpdateCommentDto,
    @CurrentUserId() userId: Types.ObjectId,
  ) {
    const isUpdated = await this.commentService.updateComment(
      userId,
      commentId,
      commentDto,
    );
    switch (isUpdated) {
      case RESPONSE_OPTIONS.NOT_FOUND:
        throw new NotFoundException();
      case RESPONSE_OPTIONS.FORBIDDEN:
        throw new ForbiddenException();
      case RESPONSE_OPTIONS.NO_CONTENT:
        throw new HttpException('No content', HttpStatus.NO_CONTENT);
    }
  }
  @UseGuards(JwtAuthGuard)
  @Put('/:id/like-status')
  async updateLikeStatus(
    @Param('id', ParseObjectIdPipe) commentId: Types.ObjectId,
    @CurrentUserId() userId: Types.ObjectId,
    @Body() likeStatusDto: LikeStatusDto,
  ) {
    const likeStatus = await this.commentService.updateLikeStatus(
      userId,
      commentId,
      likeStatusDto,
    );
    if (!likeStatus) throw new NotFoundException();
    throw new HttpException('No content', HttpStatus.NO_CONTENT);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteComment(
    @Param('id', ParseObjectIdPipe) commentId: Types.ObjectId,
    @CurrentUserId() userId: Types.ObjectId,
  ) {
    const isDeleted = await this.commentService.deleteComment(
      userId,
      commentId,
    );
    switch (isDeleted) {
      case RESPONSE_OPTIONS.NOT_FOUND:
        throw new NotFoundException();
      case RESPONSE_OPTIONS.FORBIDDEN:
        throw new ForbiddenException();
      case RESPONSE_OPTIONS.NO_CONTENT:
        throw new HttpException('No content', HttpStatus.NO_CONTENT);
    }
  }
}
