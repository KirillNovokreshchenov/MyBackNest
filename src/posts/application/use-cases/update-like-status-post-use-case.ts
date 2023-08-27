import { Types } from 'mongoose';
import { LikeStatusDto } from '../../../models/LikeStatusDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LIKE_STATUS } from '../../../models/LikeStatusEnum';
import { InjectModel } from '@nestjs/mongoose';
import { PostLike, PostLikeModelType } from '../../domain/post-like.schema';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class UpdateLikeStatusPostCommand {
  constructor(
    public userId: Types.ObjectId,
    public postId: Types.ObjectId,
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
    const user = await this.usersRepo.findUserById(command.userId);
    if (!user) return false;
    const likeIsExist = await this.postsRepository.findLikeStatus(
      command.userId,
      command.postId,
    );
    if (!likeIsExist && command.likeStatusDto.likeStatus === LIKE_STATUS.NONE) {
      return false;
    }
    if (!likeIsExist) {
      const likeStatus = post.createLikeStatus(
        command.userId,
        command.postId,
        user.login,
        command.likeStatusDto.likeStatus,
        this.PostLikeModel,
      );
      await this.postsRepository.saveStatus(likeStatus);
      await this.postsRepository.savePost(post);
      return true;
    }
    if (command.likeStatusDto.likeStatus === LIKE_STATUS.NONE) {
      post.updateLikeNone(likeIsExist.likeStatus);
      await this.postsRepository.savePost(post);
      await this.postsRepository.deleteLikeStatus(likeIsExist._id);
    } else {
      post.updateLike(command.likeStatusDto.likeStatus, likeIsExist);
      await this.postsRepository.savePost(post);
      await this.postsRepository.saveStatus(likeIsExist);
    }
    return true;
  }
}
