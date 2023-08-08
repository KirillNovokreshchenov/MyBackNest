import { Controller, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../blogs/domain/blog.schema';
import { Post, PostModelType } from '../posts/domain/post.schema';
import { User, UserModelType } from '../users/domain/user.schema';
import { Comment, CommentModelType } from '../comments/domain/comment.schema';
import {
  PasswordRecovery,
  PasswordRecoveryType,
} from '../auth/domain/password-recovery.schema';
import { Session, SessionModelType } from '../sessions/domain/session.schema';
import {
  CommentLike,
  CommentLikeModelType,
} from '../comments/domain/comment-like.schema';
import { PostLike, PostLikeModelType } from '../posts/domain/post-like.schema';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(PasswordRecovery.name)
    private passwordRecoveryModel: PasswordRecoveryType,
    @InjectModel(Session.name) private SessionModel: SessionModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
  ) {}
  @Delete('/all-data')
  async deleteAllData() {
    const comment = this.CommentModel.deleteMany();
    const user = this.UserModel.deleteMany();
    const blog = this.BlogModel.deleteMany();
    const post = this.PostModel.deleteMany();
    const recovery = this.passwordRecoveryModel.deleteMany();
    const session = this.SessionModel.deleteMany();
    const commentLike = this.CommentLikeModel.deleteMany();
    const postLike = this.PostLikeModel.deleteMany();
    await Promise.all([
      comment,
      user,
      blog,
      post,
      recovery,
      session,
      commentLike,
      postLike,
    ]);
    throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  }
}
