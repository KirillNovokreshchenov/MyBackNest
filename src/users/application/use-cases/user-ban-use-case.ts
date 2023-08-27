import { Types } from 'mongoose';
import { BanDto } from '../dto/BanDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../../comments/infractructure/comments.repository';
import { UsersRepository } from '../../infrastructure/users.repository';
import { DeviceRepository } from '../../../sessions/infrastructure/device.repository';

export class UserBanCommand {
  constructor(public userId: Types.ObjectId, public banDto: BanDto) {}
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
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) return false;
    if (command.banDto.isBanned && !user.banInfo.isBanned) {
      user.userBan(command.banDto);
      await this.usersRepository.saveUser(user);
      await this.deviceRepo.deleteAllSessionsBan(command.userId);
      await this.banUnbanContent(command.userId);
      await this._banUnbanLikesUser(command.userId, command.banDto.isBanned);
      return true;
    } else if (!command.banDto.isBanned && user.banInfo.isBanned) {
      user.userUnban();
      await this.usersRepository.saveUser(user);
      await this.banUnbanContent(command.userId);
      await this._banUnbanLikesUser(command.userId, command.banDto.isBanned);
      return true;
    }
    return true;
  }
  async banUnbanContent(userId: Types.ObjectId) {
    await this._banUnbanPostsUser(userId);
    await this._banUnbanCommentsUser(userId);
  }
  async _banUnbanPostsUser(userId: Types.ObjectId) {
    const posts = await this.postRepo.findPostsBan(userId);
    posts.map((post) => {
      post.isBannedPost();
      this.postRepo.savePost(post);
    });
  }
  async _banUnbanCommentsUser(userId: Types.ObjectId) {
    const comments = await this.commentsRepo.findCommentsBan(userId);
    comments.map((comment) => {
      comment.isBannedComment();
      this.commentsRepo.saveComment(comment);
    });
  }
  async _banUnbanLikesUser(userId: Types.ObjectId, isBanned: boolean) {
    const likesComment = await this.commentsRepo.findLikesBan(userId);
    await Promise.all(
      likesComment.map(async (like) => {
        like.isBannedLike();
        const comment = await this.commentsRepo.findComment(like.commentId);
        if (comment) {
          comment.countBan(like.likeStatus, isBanned);
          await this.commentsRepo.saveComment(comment);
        }
        await this.commentsRepo.saveStatus(like);
      }),
    );
    const likesPost = await this.postRepo.findLikesBan(userId);
    await Promise.all(
      likesPost.map(async (like) => {
        like.isBannedLike();
        const post = await this.postRepo.findPostDocument(like.postId);
        if (post) {
          post.countBan(like.likeStatus, isBanned);
          await this.postRepo.savePost(post);
        }
        await this.postRepo.saveStatus(like);
      }),
    );
  }
}
