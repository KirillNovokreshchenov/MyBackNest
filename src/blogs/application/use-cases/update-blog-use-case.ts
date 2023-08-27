import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../../posts/domain/post.schema';
import { Types } from 'mongoose';
import { UpdateBlogDto } from '../dto/UpdateBlogDto';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';
import { BlogDocument } from '../../domain/blog.schema';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateBlogCommand {
  constructor(
    public blogId: Types.ObjectId,
    public userId: Types.ObjectId,
    public blogDto: UpdateBlogDto,
  ) {}
}
@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {}
  async execute(command: UpdateBlogCommand): Promise<RESPONSE_OPTIONS> {
    const blog: BlogDocument | null = await this.blogsRepository.findBlogById(
      command.blogId,
    );
    if (!blog) return RESPONSE_OPTIONS.NOT_FOUND;
    if (blog.blogOwnerInfo.userId.toString() !== command.userId.toString())
      return RESPONSE_OPTIONS.FORBIDDEN;

    const posts = await this.blogsRepository.findPostsByBlogName(blog.name);
    this.PostModel.changeBlogName(posts, command.blogDto.name);

    await blog.updateBlog(command.blogDto);
    await this.blogsRepository.saveBlog(blog);
    return RESPONSE_OPTIONS.NO_CONTENT;
  }
}
