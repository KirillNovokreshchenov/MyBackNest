import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RESPONSE_ERROR } from '../../../models/RESPONSE_ERROR';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { IdType } from '../../../models/IdType';
import { RESPONSE_SUCCESS } from '../../../models/RESPONSE_SUCCESS';

export class DeleteBlogCommand {
  constructor(public blogId: IdType, public userId: IdType) {}
}
@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(
    command: DeleteBlogCommand,
  ): Promise<RESPONSE_ERROR | RESPONSE_SUCCESS> {
    // const blogOwnerId = await this.blogsRepository.findOwnerId(command.blogId);
    // if (!blogOwnerId) return RESPONSE_OPTIONS.NOT_FOUND;
    // if (blogOwnerId.toString() !== command.userId.toString())
    //   return RESPONSE_OPTIONS.FORBIDDEN;

    return this.blogsRepository.deleteBlog(command.blogId);
  }
}
