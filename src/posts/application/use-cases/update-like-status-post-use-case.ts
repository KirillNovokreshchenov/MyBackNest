import { LikeStatusDto } from '../../../models/LikeStatusDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LIKE_STATUS } from '../../../models/LikeStatusEnum';
import { InjectModel } from '@nestjs/mongoose';
import { PostLike, PostLikeModelType } from '../../domain/post-like.schema';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { IdType } from '../../../models/IdType';

export class UpdateLikeStatusPostCommand {
  constructor(
    public userId: IdType,
    public postId: IdType,
    public likeStatusDto: LikeStatusDto,
  ) {}
}
@CommandHandler(UpdateLikeStatusPostCommand)
export class UpdateLikeStatusPostUseCase
  implements ICommandHandler<UpdateLikeStatusPostCommand>
{
  constructor(
    protected postsRepository: PostsRepository,
    protected usersRepo: UsersRepository,
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
  ) {}
  async execute(command: UpdateLikeStatusPostCommand) {
    const post = await this.postsRepository.findPostDocument(command.postId);
    if (!post) return false;
    const userLogin = await this.usersRepo.findUserLogin(command.userId);
    if (!userLogin) return false;
    const likeData = await this.postsRepository.findLikeStatus(
      command.userId,
      command.postId,
    );
    if (!likeData && command.likeStatusDto.likeStatus === LIKE_STATUS.NONE) {
      return false;
    }
    if (!likeData) {
      const likeStatusIsCreated = await this.postsRepository.createLikeStatus(
        command.userId,
        command.postId,
        userLogin,
        command.likeStatusDto.likeStatus,
      );
      if (likeStatusIsCreated === null) return false;
      return true;
    }
    if (command.likeStatusDto.likeStatus === LIKE_STATUS.NONE) {
      const isUpdated = await this.postsRepository.updateLikeNone(
        command.postId,
        likeData,
      );
      if (isUpdated === null) return false;
    } else {
      const isUpdated = await this.postsRepository.updateLike(
        command.postId,
        command.likeStatusDto.likeStatus,
        likeData,
      );
      if (!isUpdated === null) return false;
    }
    return true;
  }
}
