import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RESPONSE_ERROR } from '../../../models/RESPONSE_ERROR';
import { CommentsRepository } from '../../infractructure/comments.repository';
import { IdType } from '../../../models/IdType';
import { RESPONSE_SUCCESS } from '../../../models/RESPONSE_SUCCESS';

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
    if (!commentOwnerId) return RESPONSE_ERROR.NOT_FOUND;
    if (command.userId.toString() !== commentOwnerId.toString())
      return RESPONSE_ERROR.FORBIDDEN;
    await this.commentRepo.deleteComment(command.commentId);
    return RESPONSE_SUCCESS.NO_CONTENT;
  }
}
