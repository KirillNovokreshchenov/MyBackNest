import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/api/users.controller';
import { UsersService } from './users/application/users.service';
import { UsersRepository } from './users/infrastructure/users.repository';
import { UsersQueryRepository } from './users/infrastructure/users.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/domain/user.schema';
import { UserAdapter } from './users/infrastructure/adapters/user.adapter';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { Blog, BlogSchema } from './blogs/domain/blog.schema';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/blogs.query.repository';
import { PostsController } from './posts/api/posts.controller';
import { PostsService } from './posts/application/posts.service';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/posts.query.repository';
import { Post, PostSchema } from './posts/domain/post.schema';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsQueryRepository } from './comments/infractructure/comments.query.repository';
import { Comment, CommentSchema } from './comments/domain/comment.schema';
import { TestingController } from './testing/testing.controller';
import { AuthController } from './auth/api/auth.controller';
import { AuthService } from './auth/application/auth.service';
import configuration from './configuration';
import { EmailAdapter } from './auth/infrastructure/adapters/email.adapter';
import { EmailManagers } from './auth/application/managers/email.managers';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  PasswordRecovery,
  PasswordRecoverySchema,
} from './auth/domain/password-recovery.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration] }),
    MongooseModule.forRoot(configuration().mongoUri),
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Blog.name,
        schema: BlogSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: Comment.name,
        schema: CommentSchema,
      },
      {
        name: PasswordRecovery.name,
        schema: PasswordRecoverySchema,
      },
    ]),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: 'kirochkaqwerty123@gmail.com', // generated ethereal user
          pass: 'otzaxohazcnetzvc', // generated ethereal password
        },
      },
    }),
  ],
  controllers: [
    AppController,
    UsersController,
    BlogsController,
    PostsController,
    CommentsController,
    TestingController,
    AuthController,
  ],
  providers: [
    AppService,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    UserAdapter,
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsQueryRepository,
    AuthService,
    EmailAdapter,
    EmailManagers,
  ],
})
export class AppModule {}
