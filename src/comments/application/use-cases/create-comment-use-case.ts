import { Types } from 'mongoose';
import { CreateCommentDto } from '../dto/CreateCommentDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RESPONSE_OPTIONS } from '../../../models/ResponseOptionsEnum';
import {
  Comment,
  CommentModelType,
  PostInfo,
} from '../../domain/comment.schema';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../infractructure/comments.repository';
import { InjectModel } from '@nestjs/mongoose';

export class CreateCommentCommand {
  constructor(
    public userId: Types.ObjectId,
    public postId: Types.ObjectId,
    public commentDto: CreateCommentDto,
  ) {}
}
@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    private usersRepo: UsersRepository,
    private postRepo: PostsRepository,
    private commentRepo: CommentsRepository,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}
  async execute(command: CreateCommentCommand) {
    const user = await this.usersRepo.findUserById(command.userId);
    if (!user) return RESPONSE_OPTIONS.NOT_FOUND;
    const post = await this.postRepo.findPostDocument(command.postId);
    if (!post) return RESPONSE_OPTIONS.NOT_FOUND;
    if (user.userIsBannedForBlog(post.blogId)) {
      return RESPONSE_OPTIONS.FORBIDDEN;
    }
    const postInfo: PostInfo = {
      id: post._id,
      title: post.title,
      blogId: post.blogId,
      blogName: post.blogName,
    };

    const comment = await this.CommentModel.createComment(
      command.userId,
      post.userId,
      user.login,
      command.commentDto,
      postInfo,
      this.CommentModel,
    );
    await this.commentRepo.saveComment(comment);
    return comment._id;
  }
}
