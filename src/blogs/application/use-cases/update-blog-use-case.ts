import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UpdateBlogDto } from '../dto/UpdateBlogDto';
import { RESPONSE_ERROR } from '../../../models/RESPONSE_ERROR';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IdType } from '../../../models/IdType';
import { RESPONSE_SUCCESS } from '../../../models/RESPONSE_SUCCESS';

export class UpdateBlogCommand {
  constructor(
    public blogId: IdType,
    public userId: IdType,
    public blogDto: UpdateBlogDto,
  ) {}
}
@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}
  async execute(
    command: UpdateBlogCommand,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    // const blogOwnerId = await this.blogsRepository.findOwnerId(command.blogId);
    // if (!blogOwnerId) return RESPONSE_OPTIONS.NOT_FOUND;
    // if (blogOwnerId.toString() !== command.userId.toString())
    //   return RESPONSE_OPTIONS.FORBIDDEN;

    return this.blogsRepository.updateBlog(command.blogId, command.blogDto);
  }
}
