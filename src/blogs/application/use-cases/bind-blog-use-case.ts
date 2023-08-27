import { BlogUserIdInputType } from '../../api/input-model/BlogUserIdInputType';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class BindBlogCommand {
  constructor(public blogAndUserId: BlogUserIdInputType) {}
}
@CommandHandler(BindBlogCommand)
export class BindBlogUseCase implements ICommandHandler<BindBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}
  async execute(command: BindBlogCommand) {
    const blog = await this.blogsRepository.findBlogById(
      command.blogAndUserId.blogId,
    );
    if (!blog) return false;
    const user = await this.blogsRepository.findUserForBlog(
      command.blogAndUserId.userId,
    );
    if (!user) return false;
    if (!blog.blogOwnerInfo) {
      return false;
    } else {
      blog.bindUser(user._id, user.login);
      return true;
    }
  }
}
