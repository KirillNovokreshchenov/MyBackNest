import { LikeStatusDto } from '../../../models/LikeStatusDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LIKE_STATUS } from '../../../models/LikeStatusEnum';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { IdType } from '../../../models/IdType';
import { isError, RESPONSE_ERROR } from '../../../models/RESPONSE_ERROR';

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
  constructor(protected postsRepository: PostsRepository) {}
  async execute(command: UpdateLikeStatusPostCommand) {
    const postId = await this.postsRepository.findPostId(command.postId);
    if (isError(postId)) return postId;
    // const userLogin = await this.usersRepo.findUserLogin(command.userId);
    // if (!userLogin) return false;
    const likeData = await this.postsRepository.findLikeStatus(
      command.userId,
      command.postId,
    );
    if (
      isError(likeData) &&
      command.likeStatusDto.likeStatus === LIKE_STATUS.NONE
    ) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
    if (isError(likeData)) {
      return this.postsRepository.createLikeStatus(
        command.userId,
        command.postId,
        command.likeStatusDto.likeStatus,
      );
    }
    if (command.likeStatusDto.likeStatus === LIKE_STATUS.NONE) {
      return this.postsRepository.updateLikeNone(command.postId, likeData);
    } else {
      return this.postsRepository.updateLike(
        command.postId,
        command.likeStatusDto.likeStatus,
        likeData,
      );
    }
  }
}
