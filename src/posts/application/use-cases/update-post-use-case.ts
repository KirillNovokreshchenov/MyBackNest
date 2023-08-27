import { BlogPostIdInputType } from '../../../blogs/api/input-model/BlogPostIdInputType';
import { Types } from 'mongoose';
import { UpdatePostDto } from '../dto/UpdatePostDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class UpdatePostCommand {
  constructor(
    public PostAndBlogId: BlogPostIdInputType,
    public userId: Types.ObjectId,
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
    post.updatePost(command.postDto);
    await this.postsRepository.savePost(post);
    return RESPONSE_OPTIONS.NO_CONTENT;
  }
}
