import { UpdatePostDto } from '../dto/UpdatePostDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isError, RESPONSE_ERROR } from '../../../models/RESPONSE_ERROR';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { IdType } from '../../../models/IdType';
import { RESPONSE_SUCCESS } from '../../../models/RESPONSE_SUCCESS';

export class UpdatePostCommand {
  constructor(
    public blogId: IdType,
    public postId: IdType,
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
  async execute(
    command: UpdatePostCommand,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    // const blogOwnerId = await this.blogsRepo.findOwnerId(
    //   command.PostAndBlogId.blogId,
    // );
    const blogIsExists = await this.blogsRepo.findBlogId(command.blogId);
    if (isError(blogIsExists)) return blogIsExists;
    // if (blogOwnerId.toString() !== command.userId.toString())
    //   return RESPONSE_OPTIONS.FORBIDDEN;

    const postIsExists = await this.postsRepository.findPostId(command.postId);
    if (isError(postIsExists)) return postIsExists;
    // if (postOwnerId.toString() !== command.userId.toString())
    //   return RESPONSE_OPTIONS.FORBIDDEN;
    return this.postsRepository.updatePost(command.postId, command.postDto);
  }
}
