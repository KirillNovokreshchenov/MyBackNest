import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../domain/blog.schema';
import { CreateBlogDto } from '../dto/CreateBlogDto';
import { Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IdType } from '../../../models/IdType';

export class CreateBlogCommand {
  constructor(public blogDto: CreateBlogDto, public userId: IdType) {}
}
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}

  async execute(command: CreateBlogCommand): Promise<Types.ObjectId | null> {
    const userData: { userId: IdType; userLogin: string } | null =
      await this.blogsRepository.findUserForBlog(command.userId);
    if (!userData) return null;
    return this.blogsRepository.createBlog(
      userData.userId,
      userData.userLogin,
      command.blogDto,
    );
  }
}
