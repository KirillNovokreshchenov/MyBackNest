import { LikeStatusDto } from '../../../models/LikeStatusDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LIKE_STATUS } from '../../../models/LikeStatusEnum';
import { CommentsRepository } from '../../infractructure/comments.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLike,
  CommentLikeModelType,
} from '../../domain/comment-like.schema';
import { IdType } from '../../../models/IdType';
import { isError, RESPONSE_ERROR } from '../../../models/RESPONSE_ERROR';

export class UpdateLikeStatusCommentCommand {
  constructor(
    public userId: IdType,
    public commentId: IdType,
    public likeStatusDto: LikeStatusDto,
  ) {}
}
@CommandHandler(UpdateLikeStatusCommentCommand)
export class UpdateLikeStatusCommentUseCase
  implements ICommandHandler<UpdateLikeStatusCommentCommand>
{
  constructor(private commentRepo: CommentsRepository) {}
  async execute(command: UpdateLikeStatusCommentCommand) {
    const commentId = await this.commentRepo.findCommentId(command.commentId);
    if (isError(commentId)) return commentId;
    const likeData = await this.commentRepo.findLikeStatus(
      command.userId,
      command.commentId,
    );
    if (
      isError(likeData) &&
      command.likeStatusDto.likeStatus === LIKE_STATUS.NONE
    ) {
      return false;
    }
    if (isError(likeData)) {
      return this.commentRepo.createLikeStatus(
        command.userId,
        command.commentId,
        command.likeStatusDto.likeStatus,
      );
    }
    if (command.likeStatusDto.likeStatus === LIKE_STATUS.NONE) {
      return this.commentRepo.updateLikeNone(command.commentId, likeData);
    } else {
      return this.commentRepo.updateLike(
        command.commentId,
        command.likeStatusDto.likeStatus,
        likeData,
      );
    }
  }
}
