import { BanDto } from '../dto/BanDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../../comments/infractructure/comments.repository';
import { UsersRepository } from '../../infrastructure/users.repository';
import { DeviceRepository } from '../../../sessions/infrastructure/device.repository';
import { IdType } from '../../../models/IdType';

export class UserBanCommand {
  constructor(public userId: IdType, public banDto: BanDto) {}
}
@CommandHandler(UserBanCommand)
export class UserBanUseCase implements ICommandHandler<UserBanCommand> {
  constructor(
    private postRepo: PostsRepository,
    private commentsRepo: CommentsRepository,
    private usersRepository: UsersRepository,
    protected deviceRepo: DeviceRepository,
  ) {}
  async execute(command: UserBanCommand) {
    const banInfo = await this.usersRepository.banStatus(command.userId);
    if (!banInfo) return false;
    if (command.banDto.isBanned && !banInfo.isBanned) {
      const isBanned = await this.usersRepository.userBan(
        command.userId,
        command.banDto,
      );
      if (isBanned === null) return false;
      await this.deviceRepo.deleteAllSessionsBan(command.userId);
      await this.banUnbanContent(command.userId, command.banDto.isBanned);
      return true;
    } else if (!command.banDto.isBanned && banInfo.isBanned) {
      const isUnbanned = await this.usersRepository.userUnban(command.userId);
      if (isUnbanned === null) return false;
      await this.banUnbanContent(command.userId, command.banDto.isBanned);
      return true;
    }
    return true;
  }
  async banUnbanContent(userId: IdType, isBanned: boolean) {
    await this.postRepo.banUnbanPost(userId, isBanned);
    await this.commentsRepo.banUnbanComment(userId, isBanned);
    await this.commentsRepo._banUnbanLikesCommentUser(userId, isBanned);
    await this.postRepo._banUnbanLikesPostUser(userId, isBanned);
  }
}
