import { Types } from 'mongoose';
import { BanUserForBlogDto } from '../dto/BanuserForBlogDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';
import { UsersRepository } from '../../infrastructure/users.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class UserBanForBlogCommand {
  constructor(
    public userId: Types.ObjectId,
    public userOwnerBlogId: Types.ObjectId,
    public banDto: BanUserForBlogDto,
  ) {}
}
@CommandHandler(UserBanForBlogCommand)
export class UserBanForBlogUseCase
  implements ICommandHandler<UserBanForBlogCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private blogsRepo: BlogsRepository,
  ) {}
  async execute(command: UserBanForBlogCommand) {
    const blog = await this.blogsRepo.findBlogById(
      new Types.ObjectId(command.banDto.blogId),
    );
    if (!blog) return RESPONSE_OPTIONS.NOT_FOUND;
    if (
      blog.blogOwnerInfo.userId.toString() !==
      command.userOwnerBlogId.toString()
    ) {
      return RESPONSE_OPTIONS.FORBIDDEN;
    }
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) return RESPONSE_OPTIONS.NOT_FOUND;

    user.banUnbanUserForBlog(command.banDto);
    await this.usersRepository.saveUser(user);
    return RESPONSE_OPTIONS.NO_CONTENT;
  }
}
