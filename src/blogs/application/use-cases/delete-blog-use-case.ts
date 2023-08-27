import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class DeleteBlogCommand {
  constructor(public blogId: Types.ObjectId, public userId: Types.ObjectId) {}
}
@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand) {
    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog) return RESPONSE_OPTIONS.NOT_FOUND;
    if (blog.blogOwnerInfo.userId.toString() !== command.userId.toString())
      return RESPONSE_OPTIONS.FORBIDDEN;

    await this.blogsRepository.deleteBlog(command.blogId);
    return RESPONSE_OPTIONS.NO_CONTENT;
  }
}
