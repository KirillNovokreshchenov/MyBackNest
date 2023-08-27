import { CreatePostDto } from '../dto/CreatePostDto';
import { Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';
import { Post, PostDocument, PostModelType } from '../../domain/post.schema';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';

export class CreatePostCommand {
  constructor(public postDto: CreatePostDto, public userId: Types.ObjectId) {}
}
@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepo: BlogsRepository,
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {}
  async execute(command: CreatePostCommand) {
    const blog = await this.blogsRepo.findBlogById(
      new Types.ObjectId(command.postDto.blogId),
    );
    if (!blog) return RESPONSE_OPTIONS.NOT_FOUND;
    if (blog.blogOwnerInfo.userId.toString() !== command.userId.toString())
      return RESPONSE_OPTIONS.FORBIDDEN;
    const newPost: PostDocument = this.PostModel.createPost(
      command.postDto,
      blog.name,
      this.PostModel,
      command.userId,
    );
    await this.postsRepository.savePost(newPost);
    return newPost._id;
  }
}
