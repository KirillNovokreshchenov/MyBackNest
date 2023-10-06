import { UpdateCommentDto } from '../dto/UpdateCommentDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RESPONSE_ERROR } from '../../../models/RESPONSE_ERROR';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommentsRepository } from '../../infractructure/comments.repository';
import { IdType } from '../../../models/IdType';
import { RESPONSE_SUCCESS } from '../../../models/RESPONSE_SUCCESS';

export class UpdateCommentCommand {
  constructor(
    public userId: IdType,
    public commentId: IdType,
    public commentDto: UpdateCommentDto,
  ) {}
}
@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    private usersRepo: UsersRepository,
    private commentRepo: CommentsRepository,
  ) {}
  async execute(command: UpdateCommentCommand) {
    // const userId = await this.usersRepo.findUserId(command.userId);
    // if (!userId) return RESPONSE_OPTIONS.NOT_FOUND;
    const commentOwnerId = await this.commentRepo.findCommentOwnerId(
      command.commentId,
    );
    if (!commentOwnerId) return RESPONSE_ERROR.NOT_FOUND;
    if (command.userId.toString() !== commentOwnerId.toString())
      return RESPONSE_ERROR.FORBIDDEN;
    const isUpdate = await this.commentRepo.updateComment(
      command.commentId,
      command.commentDto,
    );
    if (isUpdate === null) return RESPONSE_ERROR.NOT_FOUND;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }
}
