import { Types } from 'mongoose';
import { LikeStatusDto } from '../../../models/LikeStatusDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LIKE_STATUS } from '../../../models/LikeStatusEnum';
import { CommentsRepository } from '../../infractructure/comments.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLike,
  CommentLikeModelType,
} from '../../domain/comment-like.schema';

export class UpdateLikeStatusCommentCommand {
  constructor(
    public userId: Types.ObjectId,
    public commentId: Types.ObjectId,
    public likeStatusDto: LikeStatusDto,
  ) {}
}
@CommandHandler(UpdateLikeStatusCommentCommand)
export class UpdateLikeStatusCommentUseCase
  implements ICommandHandler<UpdateLikeStatusCommentCommand>
{
  constructor(
    private commentRepo: CommentsRepository,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
  ) {}
  async execute(command: UpdateLikeStatusCommentCommand) {
    const comment = await this.commentRepo.findComment(command.commentId);
    if (!comment) return false;
    const likeIsExist = await this.commentRepo.findLikeStatus(
      command.userId,
      command.commentId,
    );
    if (!likeIsExist && command.likeStatusDto.likeStatus === LIKE_STATUS.NONE) {
      return false;
    }
    if (!likeIsExist) {
      const likeStatus = comment.createLikeStatus(
        command.userId,
        command.commentId,
        command.likeStatusDto.likeStatus,
        this.CommentLikeModel,
      );
      await this.commentRepo.saveStatus(likeStatus);
      await this.commentRepo.saveComment(comment);
      return true;
    }
    if (command.likeStatusDto.likeStatus === LIKE_STATUS.NONE) {
      comment.updateLikeNone(likeIsExist.likeStatus);
      await this.commentRepo.saveComment(comment);
      await this.commentRepo.deleteLikeStatus(likeIsExist._id);
    } else {
      comment.updateLike(command.likeStatusDto.likeStatus, likeIsExist);
      await this.commentRepo.saveComment(comment);
      await this.commentRepo.saveStatus(likeIsExist);
    }
    return true;
  }
}
