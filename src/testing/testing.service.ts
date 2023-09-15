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
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingService {
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

  async deleteAllData() {
    const comment = await this.CommentModel.deleteMany();
    const user = await this.UserModel.deleteMany();
    const blog = await this.BlogModel.deleteMany();
    const post = await this.PostModel.deleteMany();
    const recovery = await this.passwordRecoveryModel.deleteMany();
    const session = await this.SessionModel.deleteMany();
    const commentLike = await this.CommentLikeModel.deleteMany();
    const postLike = await this.PostLikeModel.deleteMany();
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
  }
}

export class TestingSQLService {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async deleteAllData() {
    await this.dataSource.query(`
    DELETE FROM public.comments_likes
    `);
    await this.dataSource.query(`
    DELETE FROM public.posts_likes
    `);
    await this.dataSource.query(`
    DELETE FROM public.comments
    `);
    await this.dataSource.query(`
    DELETE FROM public.posts
    `);
    await this.dataSource.query(`
    DELETE FROM public.blogs
    `);
    await this.dataSource.query(`
    DELETE FROM public.sessions
    `);
    await this.dataSource.query(`
    DELETE FROM public.email_confirmation
    `);
    await this.dataSource.query(`
    DELETE FROM public.recovery_password
    `);
    await this.dataSource.query(`
    DELETE FROM public.users
    `);
    await this.dataSource.query(`
    DELETE FROM public.sa_blogs
    `);
    await this.dataSource.query(`
    DELETE FROM public.sa_posts
    `);
    throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  }
}
