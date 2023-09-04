import { BanBlogDto } from '../../../blogs/application/dto/BanBlogDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../../comments/infractructure/comments.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { IdType } from '../../../models/IdType';

export class BanBlogCommand {
  constructor(public blogId: IdType, public banBlogDto: BanBlogDto) {}
}
@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
  constructor(
    private postRepo: PostsRepository,
    private commentsRepo: CommentsRepository,
    private blogsRepo: BlogsRepository,
  ) {}
  async execute(command: BanBlogCommand) {
    const isBanned = await this.blogsRepo.bunUnbanBlog(
      command.blogId,
      command.banBlogDto,
    );
    if (isBanned === null) return false;
    await this.postRepo.PostsBlogBan(
      command.blogId,
      command.banBlogDto.isBanned,
    );
    await this.commentsRepo.CommentsBlogBan(
      command.blogId,
      command.banBlogDto.isBanned,
    );
    return true;
  }
}
