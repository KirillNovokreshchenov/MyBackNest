import { BlogPostIdInputType } from '../../../blogs/api/input-model/BlogPostIdInputType';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { IdType } from '../../../models/IdType';

export class DeletePostCommand {
  constructor(
    public PostAndBlogId: BlogPostIdInputType,
    public userId: IdType,
  ) {}
}
@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepo: BlogsRepository,
  ) {}
  async execute(command: DeletePostCommand) {
    const blogOwnerId = await this.blogsRepo.findOwnerId(
      command.PostAndBlogId.blogId,
    );
    if (!blogOwnerId) return RESPONSE_OPTIONS.NOT_FOUND;
    if (blogOwnerId.toString() !== command.userId.toString())
      return RESPONSE_OPTIONS.FORBIDDEN;
    const postOwnerId = await this.postsRepository.findPostOwnerId(
      command.PostAndBlogId.postId,
    );
    if (!postOwnerId) return RESPONSE_OPTIONS.NOT_FOUND;
    if (postOwnerId.toString() !== command.userId.toString())
      return RESPONSE_OPTIONS.FORBIDDEN;
    await this.postsRepository.deletePost(command.PostAndBlogId.postId);
    return RESPONSE_OPTIONS.NO_CONTENT;
  }
}
