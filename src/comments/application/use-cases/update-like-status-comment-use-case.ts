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
    if (!commentId) return false;
    const likeData: { likeId: IdType; likeStatus: LIKE_STATUS } | null =
      await this.commentRepo.findLikeStatus(command.userId, command.commentId);
    if (!likeData && command.likeStatusDto.likeStatus === LIKE_STATUS.NONE) {
      return false;
    }
    if (!likeData) {
      const likeStatusIsCreated = await this.commentRepo.createLikeStatus(
        command.userId,
        command.commentId,
        command.likeStatusDto.likeStatus,
      );
      if (likeStatusIsCreated === null) return false;
      return true;
    }
    if (command.likeStatusDto.likeStatus === LIKE_STATUS.NONE) {
      const isUpdated = await this.commentRepo.updateLikeNone(
        command.commentId,
        likeData,
      );
      if (isUpdated === null) return false;
    } else {
      const isUpdated = await this.commentRepo.updateLike(
        command.commentId,
        command.likeStatusDto.likeStatus,
        likeData,
      );
      if (!isUpdated === null) return false;
    }
    return true;
  }
}
