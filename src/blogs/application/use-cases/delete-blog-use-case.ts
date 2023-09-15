import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { IdType } from '../../../models/IdType';

export class DeleteBlogCommand {
  constructor(public blogId: IdType, public userId: IdType) {}
}
@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand) {
    // const blogOwnerId = await this.blogsRepository.findOwnerId(command.blogId);
    // if (!blogOwnerId) return RESPONSE_OPTIONS.NOT_FOUND;
    // if (blogOwnerId.toString() !== command.userId.toString())
    //   return RESPONSE_OPTIONS.FORBIDDEN;

    const isDeleted = await this.blogsRepository.deleteBlog(command.blogId);
    if (isDeleted === null) return RESPONSE_OPTIONS.NOT_FOUND;
    return RESPONSE_OPTIONS.NO_CONTENT;
  }
}
