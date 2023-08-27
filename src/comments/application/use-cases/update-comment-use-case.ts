import { Types } from 'mongoose';
import { UpdateCommentDto } from '../dto/UpdateCommentDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommentsRepository } from '../../infractructure/comments.repository';

export class UpdateCommentCommand {
  constructor(
    public userId: Types.ObjectId,
    public commentId: Types.ObjectId,
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
    const user = await this.usersRepo.findUserById(command.userId);
    if (!user) return RESPONSE_OPTIONS.NOT_FOUND;
    const comment = await this.commentRepo.findComment(command.commentId);
    if (!comment) return RESPONSE_OPTIONS.NOT_FOUND;
    if (command.userId.toString() !== comment.userId.toString())
      return RESPONSE_OPTIONS.FORBIDDEN;
    comment.updateComment(command.commentDto);
    await this.commentRepo.saveComment(comment);
    return RESPONSE_OPTIONS.NO_CONTENT;
  }
}
