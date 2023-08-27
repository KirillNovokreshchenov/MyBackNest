import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../domain/blog.schema';
import { CreateBlogDto } from '../dto/CreateBlogDto';
import { Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateBlogCommand {
  constructor(public blogDto: CreateBlogDto, public userId: Types.ObjectId) {}
}
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}

  async execute(command: CreateBlogCommand): Promise<Types.ObjectId | null> {
    const foundUser = await this.blogsRepository.findUserForBlog(
      command.userId,
    );
    if (!foundUser) return null;
    const newBlog = this.BlogModel.createNewBlog(
      command.blogDto,
      command.userId,
      foundUser.login,
      this.BlogModel,
    );
    await this.blogsRepository.saveBlog(newBlog);
    return newBlog._id;
  }
}
