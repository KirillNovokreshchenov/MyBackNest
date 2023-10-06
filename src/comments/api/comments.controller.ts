import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from '../infractructure/comments.query.repository';
import { CommentViewModel } from './view-models/CommentViewModel';
import { ParseObjectIdPipe } from '../../pipes-global/parse-object-id-pipe.service';
import { UpdateCommentDto } from '../application/dto/UpdateCommentDto';
import { CommentService } from '../application/comment.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  CurrentUserId,
  ParseCurrentIdDecorator,
} from '../../auth/decorators/create-param-current-id.decarator';
import { LikeStatusDto } from '../../models/LikeStatusDto';
import { JwtLikeAuthGuard } from '../../auth/guards/jwt-like-auth.guard';
import { switchError } from '../../helpers/switch-error';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/use-cases/update-comment-use-case';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment-use-case';
import { UpdateLikeStatusCommentCommand } from '../application/use-cases/update-like-status-comment-use-case';
import { IdType } from '../../models/IdType';
import { isError } from '../../models/RESPONSE_ERROR';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';

@Controller('comments')
export class CommentsController {
  constructor(
    protected commentsQueryRepository: CommentsQueryRepository,
    protected commentService: CommentService,
    private commandBus: CommandBus,
  ) {}
  @UseGuards(JwtLikeAuthGuard)
  @Get('/:id')
  async findCommentById(
    @Param('id', ParseObjectIdPipe) commentId: IdType,
    @CurrentUserId(ParseCurrentIdDecorator) userId?: IdType,
  ): Promise<CommentViewModel> {
    const comment = await this.commentsQueryRepository.findComment(
      commentId,
      userId,
    );
    if (isError(comment)) return switchError(comment);
    return comment;
  }
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async updateComment(
    @Param('id', ParseObjectIdPipe) commentId: IdType,
    @Body() commentDto: UpdateCommentDto,
    @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  ) {
    const isUpdated = await this.commandBus.execute(
      new UpdateCommentCommand(userId, commentId, commentDto),
    );
    if (isError(isUpdated)) return switchError(isUpdated);
    throw new HttpException(RESPONSE_SUCCESS.NO_CONTENT, HttpStatus.NO_CONTENT);
  }
  @UseGuards(JwtAuthGuard)
  @Put('/:id/like-status')
  async updateLikeStatus(
    @Param('id', ParseObjectIdPipe) commentId: IdType,
    @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
    @Body() likeStatusDto: LikeStatusDto,
  ) {
    const likeStatus = await this.commandBus.execute(
      new UpdateLikeStatusCommentCommand(userId, commentId, likeStatusDto),
    );
    if (isError(likeStatus)) return switchError(likeStatus);
    throw new HttpException(RESPONSE_SUCCESS.NO_CONTENT, HttpStatus.NO_CONTENT);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteComment(
    @Param('id', ParseObjectIdPipe) commentId: IdType,
    @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  ) {
    const isDeleted = await this.commandBus.execute(
      new DeleteCommentCommand(userId, commentId),
    );
    if (isError(isDeleted)) return switchError(isDeleted);
    throw new HttpException(RESPONSE_SUCCESS.NO_CONTENT, HttpStatus.NO_CONTENT);
  }
}
