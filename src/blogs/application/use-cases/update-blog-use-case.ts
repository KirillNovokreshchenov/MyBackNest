import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../../posts/domain/post.schema';
import { UpdateBlogDto } from '../dto/UpdateBlogDto';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IdType } from '../../../models/IdType';

export class UpdateBlogCommand {
  constructor(
    public blogId: IdType,
    public userId: IdType,
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
    const blogOwnerId = await this.blogsRepository.findOwnerId(command.blogId);
    if (!blogOwnerId) return RESPONSE_OPTIONS.NOT_FOUND;
    if (blogOwnerId.toString() !== command.userId.toString())
      return RESPONSE_OPTIONS.FORBIDDEN;

    const isUpdated = await this.blogsRepository.updateBlog(
      command.blogId,
      command.blogDto,
    );
    if (isUpdated === null) return RESPONSE_OPTIONS.NOT_FOUND;
    return RESPONSE_OPTIONS.NO_CONTENT;
  }
}
