import { BlogPostIdInputType } from '../../../blogs/api/input-model/BlogPostIdInputType';
import { Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class DeletePostCommand {
  constructor(
    public PostAndBlogId: BlogPostIdInputType,
    public userId: Types.ObjectId,
  ) {}
}
@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepo: BlogsRepository,
  ) {}
  async execute(command: DeletePostCommand) {
    const blog = await this.blogsRepo.findBlogById(
      command.PostAndBlogId.blogId,
    );
    if (!blog) return RESPONSE_OPTIONS.NOT_FOUND;
    if (blog.blogOwnerInfo.userId.toString() !== command.userId.toString())
      return RESPONSE_OPTIONS.FORBIDDEN;
    const post = await this.postsRepository.findPostDocument(
      command.PostAndBlogId.postId,
    );
    if (!post) return RESPONSE_OPTIONS.NOT_FOUND;
    if (post.userId.toString() !== command.userId.toString())
      return RESPONSE_OPTIONS.FORBIDDEN;
    await this.postsRepository.deletePost(command.PostAndBlogId.postId);
    return RESPONSE_OPTIONS.NO_CONTENT;
  }
}
