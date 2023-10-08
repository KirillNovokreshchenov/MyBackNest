import { CreatePostDto } from '../dto/CreatePostDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isError, RESPONSE_ERROR } from '../../../models/RESPONSE_ERROR';
import { Post, PostModelType } from '../../domain/post.schema';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { IdType } from '../../../models/IdType';

export class CreatePostCommand {
  constructor(public postDto: CreatePostDto, public userId: IdType) {}
}
@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepo: BlogsRepository,
  ) {}
  async execute(command: CreatePostCommand): Promise<IdType | RESPONSE_ERROR> {
    const blogIsExists = await this.blogsRepo.findBlogId(
      command.postDto.blogId,
    );
    if (isError(blogIsExists)) return blogIsExists;
    // if (blogData.ownerId.toString() !== command.userId.toString())
    //   return RESPONSE_OPTIONS.FORBIDDEN;
    const postId = await this.postsRepository.createPost(
      command.postDto,
      command.userId,
    );
    return postId;
  }
}
