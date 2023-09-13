import { configModule } from './configuration/ConfigModule';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './configuration/configuration';

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsController } from './blogs/api/blogs.controller';
import { UsersController } from './users/api/users.controller';
import { UsersService } from './users/application/users.service';
import {
  UsersRepository,
  UsersSQLRepository,
} from './users/infrastructure/users.repository';
import {
  UsersQueryRepository,
  UsersSQLQueryRepository,
} from './users/infrastructure/users.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/domain/user.schema';
import { BcryptAdapter } from './users/infrastructure/adapters/bcryptAdapter';

import { BlogsService } from './blogs/application/blogs.service';
import { Blog, BlogSchema } from './blogs/domain/blog.schema';
import {
  BlogsRepository,
  BlogsSQLRepository,
} from './blogs/infrastructure/blogs.repository';

import {
  BlogsQueryRepository,
  BlogsSQLQueryRepository,
} from './blogs/infrastructure/blogs.query.repository';
import { PostsController } from './posts/api/posts.controller';
import { PostsService } from './posts/application/posts.service';
import {
  PostsRepository,
  PostsSQLRepository,
} from './posts/infrastructure/posts.repository';
import {
  PostsQueryRepository,
  PostsSQLQueryRepository,
} from './posts/infrastructure/posts.query.repository';
import { Post, PostSchema } from './posts/domain/post.schema';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsQueryRepository } from './comments/infractructure/comments.query.repository';
import { Comment, CommentSchema } from './comments/domain/comment.schema';
import { TestingController } from './testing/testing.controller';
import { AuthController } from './auth/api/auth.controller';
import { AuthService } from './auth/application/auth.service';
import { EmailAdapter } from './auth/infrastructure/adapters/email.adapter';
import { EmailManagers } from './auth/application/managers/email.managers';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  PasswordRecovery,
  PasswordRecoverySchema,
} from './auth/domain/password-recovery.schema';
import { BasicStrategy } from './auth/strategies/basic.strategy';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { Session, SessionSchema } from './sessions/domain/session.schema';
import {
  DeviceRepository,
  DeviceSQLRepository,
} from './sessions/infrastructure/device.repository';
import { JwtRefreshStrategy } from './auth/strategies/jwt.refresh.strategy';
import { DeviceController } from './sessions/api/device.controller';
import { DeviceService } from './sessions/application/device.service';
import {
  DeviceQueryRepository,
  DeviceSQLQueryRepository,
} from './sessions/infrastructure/device.query.repository';
import { CommentService } from './comments/application/comment.service';
import { CommentsRepository } from './comments/infractructure/comments.repository';
import { PostLike, PostLikeSchema } from './posts/domain/post-like.schema';
import {
  CommentLike,
  CommentLikeSchema,
} from './comments/domain/comment-like.schema';
import { BlogExistsRule } from './posts/validators/custom-blogId.validator';
import { BloggerController } from './blogs/api/blogger.controller';
import { SaBlogController } from './blogs/api/saBlogController';
import { SaUsersController } from './users/api/sa-users.controller';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog-use-case';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog-use-case';
import { BindBlogUseCase } from './blogs/application/use-cases/bind-blog-use-case';
import { CheckCredentialsUseCase } from './auth/application/use-cases/check-credentials-use-case';
import { CreateTokensUseCase } from './auth/application/use-cases/create-tokens-use-case';
import { NewTokensUseCase } from './auth/application/use-cases/new-tokens-use-case';
import { LogoutUseCase } from './auth/application/use-cases/logout-use-case';
import { CreateUserByRegistrationUseCase } from './users/application/use-cases/create-user-by-registration-use-case';
import { ConfirmByEmailUseCase } from './users/application/use-cases/confirm-by-email-use-case';
import { EmailResendingUseCase } from './users/application/use-cases/email -resending-use-case';
import { RecoveryPasswordUseCase } from './users/application/use-cases/recovery -password-use-case';
import { CreateUserByAdminUseCase } from './users/application/use-cases/create -user-by-admin-use-case';
import { DeleteUserUseCase } from './users/application/use-cases/delete-user-use-case';
import { NewPasswordUseCase } from './users/application/use-cases/new-password-use-case';
import { UserBanUseCase } from './users/application/use-cases/user-ban-use-case';
import { UserBanForBlogUseCase } from './users/application/use-cases/user-ban-for-blog-use-case';
import { BanBlogUseCase } from './users/application/use-cases/ban-blog-use-case';
import { DeleteAllSessionsUseCase } from './sessions/application/use-cases/delete-all-sessions-use-case';
import { DeleteSessionUseCase } from './sessions/application/use-cases/delete -session-use-case';
import { CreatePostUseCase } from './posts/application/use-cases/create-post-use-case';
import { UpdatePostUseCase } from './posts/application/use-cases/update-post-use-case';
import { DeletePostUseCase } from './posts/application/use-cases/delete-post-use-case';
import { UpdateLikeStatusPostUseCase } from './posts/application/use-cases/update-like-status-post-use-case';
import { CreateCommentUseCase } from './comments/application/use-cases/create-comment-use-case';
import { UpdateCommentUseCase } from './comments/application/use-cases/update-comment-use-case';
import { DeleteCommentUseCase } from './comments/application/use-cases/delete-comment-use-case';
import { UpdateLikeStatusCommentUseCase } from './comments/application/use-cases/update-like-status-comment-use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'process';
import { TestingService, TestingSQLService } from './testing/testing.service';
import { LoginExistsRule } from './users/validators/custom-login-exists.validator';
import { EmailExistsRule } from './users/validators/custom-email-exists.validator';

const useCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  BindBlogUseCase,
  CheckCredentialsUseCase,
  CreateTokensUseCase,
  NewTokensUseCase,
  LogoutUseCase,
  CreateUserByRegistrationUseCase,
  ConfirmByEmailUseCase,
  EmailResendingUseCase,
  RecoveryPasswordUseCase,
  CreateUserByAdminUseCase,
  DeleteUserUseCase,
  NewPasswordUseCase,
  UserBanUseCase,
  UserBanForBlogUseCase,
  BanBlogUseCase,
  DeleteAllSessionsUseCase,
  DeleteSessionUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  UpdateLikeStatusPostUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  UpdateLikeStatusCommentUseCase,
];

@Module({
  imports: [
    configModule,
    CqrsModule,
    TypeOrmModule.forRootAsync({
      imports: [configModule],
      useFactory: (configService: ConfigService<ConfigType>) => ({
        type: 'postgres',
        // url: configService.get('sql.DB_URL', { infer: true }),
        host: configService.get('sql.HOST_DB', { infer: true }),
        port: configService.get('sql.PORT_DB', { infer: true }),
        username: configService.get('sql.USERNAME_DB', { infer: true }),
        password: configService.get('sql.PASSWORD_DB', { infer: true }),
        database: configService.get('sql.NAME_DB', { infer: true }),
        autoLoadEntities: false,
        synchronize: false,
        ssl: true,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [configModule],
      useFactory: (configService: ConfigService<ConfigType>) => ({
        uri: configService.get('mongoUri'),
      }),
      inject: [ConfigService],
    }),
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
      {
        name: Session.name,
        schema: SessionSchema,
      },
      {
        name: PostLike.name,
        schema: PostLikeSchema,
      },
      {
        name: CommentLike.name,
        schema: CommentLikeSchema,
      },
    ]),
    JwtModule.registerAsync({
      imports: [configModule],
      useFactory: (configService: ConfigService<ConfigType>) => ({
        secret: configService.get('jwt.secretAT', { infer: true }),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [configModule],
      useFactory: (configService: ConfigService<ConfigType>) => ({
        secret: configService.get('jwt.secretRT', { infer: true }),
        signOptions: { expiresIn: '90m' },
      }),
      inject: [ConfigService],
    }),
    // MailerModule.forRoot({
    //   transport: {
    //     // host: 'smtp.gmail.com',
    //     // port: 465,
    //     service: 'Gmail',
    //     // secure: true,
    //     auth: {
    //       user: 'kirochkaqwerty123@gmail.com',
    //       pass: 'otzaxohazcnetzvc',
    //     },
    //   },
    //   defaults: {
    //     from: 'Your Name <kirochkaqwerty123@gmail.com>',
    //   },
    // }),
  ],
  controllers: [
    AppController,
    UsersController,
    BlogsController,
    PostsController,
    CommentsController,
    AuthController,
    DeviceController,
    BloggerController,
    SaBlogController,
    SaUsersController,
    TestingController,
  ],
  providers: [
    AppService,
    UsersService,
    BcryptAdapter,
    BlogsService,
    {
      provide: BlogsRepository,
      useClass:
        process.env.REPO_TYPE === 'MONGO'
          ? BlogsRepository
          : BlogsSQLRepository,
    },
    {
      provide: UsersRepository,
      useClass:
        process.env.REPO_TYPE === 'MONGO'
          ? UsersRepository
          : UsersSQLRepository,
    },
    {
      provide: UsersQueryRepository,
      useClass:
        process.env.REPO_TYPE === 'MONGO'
          ? UsersQueryRepository
          : UsersSQLQueryRepository,
    },
    {
      provide: DeviceRepository,
      useClass:
        process.env.REPO_TYPE === 'MONGO'
          ? DeviceRepository
          : DeviceSQLRepository,
    },
    {
      provide: DeviceQueryRepository,
      useClass:
        process.env.REPO_TYPE === 'MONGO'
          ? DeviceQueryRepository
          : DeviceSQLQueryRepository,
    },
    {
      provide: TestingService,
      useClass:
        process.env.REPO_TYPE === 'MONGO' ? TestingService : TestingSQLService,
    },
    {
      provide: BlogsQueryRepository,
      useClass:
        process.env.REPO_TYPE === 'MONGO'
          ? BlogsQueryRepository
          : BlogsSQLQueryRepository,
    },
    {
      provide: PostsRepository,
      useClass:
        process.env.REPO_TYPE === 'MONGO'
          ? PostsRepository
          : PostsSQLRepository,
    },
    {
      provide: PostsQueryRepository,
      useClass:
        process.env.REPO_TYPE === 'MONGO'
          ? PostsQueryRepository
          : PostsSQLQueryRepository,
    },
    PostsService,
    CommentsQueryRepository,
    AuthService,
    EmailAdapter,
    EmailManagers,
    BasicStrategy,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    DeviceService,
    CommentService,
    CommentsRepository,
    BlogExistsRule,
    LoginExistsRule,
    EmailExistsRule,
    BcryptAdapter,
    ...useCases,
  ],
})
export class AppModule {}
