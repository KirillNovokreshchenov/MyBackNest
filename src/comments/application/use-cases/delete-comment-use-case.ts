import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';
import { CommentsRepository } from '../../infractructure/comments.repository';
import { IdType } from '../../../models/IdType';

export class DeleteCommentCommand {
  constructor(public userId: IdType, public commentId: IdType) {}
}
@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private commentRepo: CommentsRepository) {}
  async execute(command: DeleteCommentCommand) {
    const commentOwnerId = await this.commentRepo.findCommentOwnerId(
      command.commentId,
    );
    if (!commentOwnerId) return RESPONSE_OPTIONS.NOT_FOUND;
    if (command.userId.toString() !== commentOwnerId.toString())
      return RESPONSE_OPTIONS.FORBIDDEN;
    await this.commentRepo.deleteComment(command.commentId);
    return RESPONSE_OPTIONS.NO_CONTENT;
  }
}
