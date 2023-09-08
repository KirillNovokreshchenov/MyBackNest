import { BanUserForBlogDto } from "../dto/BanuserForBlogDto";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RESPONSE_OPTIONS } from "../../../models/ResponseOptionsEnum";
import { UsersRepository } from "../../infrastructure/users.repository";
import { BlogsRepository } from "../../../blogs/infrastructure/blogs.repository";
import { IdType } from "../../../models/IdType";

export class UserBanForBlogCommand {
  constructor(
    public userId: IdType,
    public userOwnerBlogId: IdType,
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
    const ownerBlogId = await this.blogsRepo.getOwnerId(command.banDto.blogId);
    if (!ownerBlogId) return RESPONSE_OPTIONS.NOT_FOUND;
    if (ownerBlogId.toString() !== command.userOwnerBlogId.toString()) {
      return RESPONSE_OPTIONS.FORBIDDEN;
    }
    const isBannedUnbanned = await this.usersRepository.banUnbanUserForBlog(
      command.userId,
      command.banDto,
    );
    if (isBannedUnbanned === null) return RESPONSE_OPTIONS.NOT_FOUND;
    return RESPONSE_OPTIONS.NO_CONTENT;
  }
}
