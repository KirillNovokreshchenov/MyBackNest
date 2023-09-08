import { BlogUserIdInputType } from "../../api/input-model/BlogUserIdInputType";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "../../infrastructure/blogs.repository";
import { IdType } from "../../../models/IdType";

export class BindBlogCommand {
  constructor(public blogAndUserId: BlogUserIdInputType) {}
}
@CommandHandler(BindBlogCommand)
export class BindBlogUseCase implements ICommandHandler<BindBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}
  async execute(command: BindBlogCommand) {
    const userData: { userId: IdType; userLogin: string } | null =
      await this.blogsRepository.findUserForBlog(command.blogAndUserId.userId);
    if (!userData) return false;
    const blogOwnerId = await this.blogsRepository.findOwnerId(
      command.blogAndUserId.blogId,
    );
    if (blogOwnerId) {
      return false;
    } else {
      const isBind = await this.blogsRepository.bindBlog(
        command.blogAndUserId.blogId,
        userData.userId,
        userData.userLogin,
      );
      if (isBind === null) return false;
      return true;
    }
  }
}
