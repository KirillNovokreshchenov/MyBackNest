import { CreatePostDto } from '../dto/CreatePostDto';
import { Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';
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
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {}
  async execute(command: CreatePostCommand) {
    const blogData: { ownerId: IdType; blogName: string } | null =
      await this.blogsRepo.findDataBlog(command.postDto.blogId);
    if (!blogData) return RESPONSE_OPTIONS.NOT_FOUND;
    if (blogData.ownerId.toString() !== command.userId.toString())
      return RESPONSE_OPTIONS.FORBIDDEN;
    const postId = await this.postsRepository.createPost(
      command.postDto,
      blogData.blogName,
      command.userId,
    );
    return postId;
  }
}
