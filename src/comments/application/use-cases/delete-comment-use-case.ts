import { Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';
import { CommentsRepository } from '../../infractructure/comments.repository';

export class DeleteCommentCommand {
  constructor(
    public userId: Types.ObjectId,
    public commentId: Types.ObjectId,
  ) {}
}
@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private commentRepo: CommentsRepository) {}
  async execute(command: DeleteCommentCommand) {
    const comment = await this.commentRepo.findComment(command.commentId);
    if (!comment) return RESPONSE_OPTIONS.NOT_FOUND;
    if (command.userId.toString() !== comment.userId.toString())
      return RESPONSE_OPTIONS.FORBIDDEN;
    await this.commentRepo.deleteComment(command.commentId);
    return RESPONSE_OPTIONS.NO_CONTENT;
  }
}
