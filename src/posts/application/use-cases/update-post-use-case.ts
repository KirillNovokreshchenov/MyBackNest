import { BlogPostIdInputType } from '../../../blogs/api/input-model/BlogPostIdInputType';
import { UpdatePostDto } from '../dto/UpdatePostDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { IdType } from '../../../models/IdType';

export class UpdatePostCommand {
  constructor(
    public PostAndBlogId: BlogPostIdInputType,
    public userId: IdType,
    public postDto: UpdatePostDto,
  ) {}
}
@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepo: BlogsRepository,
  ) {}
  async execute(command: UpdatePostCommand) {
    // const blogOwnerId = await this.blogsRepo.findOwnerId(
    //   command.PostAndBlogId.blogId,
    // );
    const blogOwnerId = await this.blogsRepo.findBlogId(
      command.PostAndBlogId.blogId,
    );
    if (!blogOwnerId) return RESPONSE_OPTIONS.NOT_FOUND;
    // if (blogOwnerId.toString() !== command.userId.toString())
    //   return RESPONSE_OPTIONS.FORBIDDEN;

    const postOwnerId = await this.postsRepository.findPostId(
      command.PostAndBlogId.postId,
    );
    if (!postOwnerId) return RESPONSE_OPTIONS.NOT_FOUND;
    // if (postOwnerId.toString() !== command.userId.toString())
    //   return RESPONSE_OPTIONS.FORBIDDEN;
    const isUpdated = await this.postsRepository.updatePost(
      command.PostAndBlogId.postId,
      command.postDto,
    );
    if (isUpdated === null) return RESPONSE_OPTIONS.NOT_FOUND;
    return RESPONSE_OPTIONS.NO_CONTENT;
  }
}
