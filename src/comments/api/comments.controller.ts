import {
  Body,
  Controller,
  Delete,
  Get,
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
import { LikeStatusDto } from '../../models/LikeStatusDto';
import { JwtLikeAuthGuard } from '../../auth/guards/jwt-like-auth.guard';
import { switchError } from '../../helpers/switch-error';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/use-cases/update-comment-use-case';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment-use-case';
import { UpdateLikeStatusCommentCommand } from '../application/use-cases/update-like-status-comment-use-case';

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
    const isUpdated = await this.commandBus.execute(
      new UpdateCommentCommand(userId, commentId, commentDto),
    );
    switchError(isUpdated);
  }
  @UseGuards(JwtAuthGuard)
  @Put('/:id/like-status')
  async updateLikeStatus(
    @Param('id', ParseObjectIdPipe) commentId: Types.ObjectId,
    @CurrentUserId() userId: Types.ObjectId,
    @Body() likeStatusDto: LikeStatusDto,
  ) {
    const likeStatus = await this.commandBus.execute(
      new UpdateLikeStatusCommentCommand(userId, commentId, likeStatusDto),
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
    const isDeleted = await this.commandBus.execute(
      new DeleteCommentCommand(userId, commentId),
    );
    switchError(isDeleted);
  }
}
