import { CreateCommentDto } from '../dto/CreateCommentDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../infractructure/comments.repository';
import { IdType } from '../../../models/IdType';

export class CreateCommentCommand {
  constructor(
    public userId: IdType,
    public postId: IdType,
    public commentDto: CreateCommentDto,
  ) {}
}
@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    private usersRepo: UsersRepository,
    private postRepo: PostsRepository,
    private commentRepo: CommentsRepository,
  ) {}
  async execute(command: CreateCommentCommand) {
    const userLogin = await this.usersRepo.findUserLogin(command.userId);
    if (!userLogin) return RESPONSE_OPTIONS.NOT_FOUND;
    const blogDataByPost: { ownerBlogId: IdType; blogId: IdType } | null =
      await this.postRepo.findOwnerBlogId(command.postId);
    if (!blogDataByPost) return RESPONSE_OPTIONS.NOT_FOUND;
    const isBannedForBlog = await this.usersRepo.isBannedForBlog(
      blogDataByPost.blogId,
      command.userId,
    );
    if (isBannedForBlog) {
      return RESPONSE_OPTIONS.FORBIDDEN;
    }

    const commentId = await this.commentRepo.createComment(
      command.userId,
      command.postId,
      blogDataByPost.ownerBlogId,
      userLogin,
      command.commentDto,
    );

    return commentId;
  }
}
