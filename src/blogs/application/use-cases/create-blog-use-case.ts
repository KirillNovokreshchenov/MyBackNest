import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CreateBlogDto } from '../dto/CreateBlogDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IdType } from '../../../models/IdType';

export class CreateBlogCommand {
  constructor(public blogDto: CreateBlogDto, public userId: IdType) {}
}
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<IdType | null> {
    return this.blogsRepository.createBlog(command.userId, command.blogDto);
  }
}
