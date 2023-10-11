import { configModule } from './configuration/ConfigModule';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './configuration/configuration';

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsController } from './blogs/api/blogs.controller';
import { UsersController } from './users/api/users.controller';
import { UsersService } from './users/application/users.service';
import { UsersRepository } from './users/infrastructure/users.repository';
import {
  UsersQueryRepository,
  UsersSQLQueryRepository,
} from './users/infrastructure/users.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/domain/user.schema';
import { BcryptAdapter } from './users/infrastructure/adapters/bcryptAdapter';

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
import {
  CommentsQueryRepository,
  CommentsSQLQueryRepository,
} from './comments/infractructure/comments.query.repository';
import { Comment, CommentSchema } from './comments/domain/comment.schema';
import { TestingController } from './testing/testing.controller';
import { AuthController } from './auth/api/auth.controller';
import { AuthService } from './auth/application/auth.service';
import { EmailAdapter } from './auth/infrastructure/adapters/email.adapter';
import { EmailManagers } from './auth/application/managers/email.managers';
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
import { DeviceRepository } from './sessions/infrastructure/device.repository';
import { JwtRefreshStrategy } from './auth/strategies/jwt.refresh.strategy';
import { DeviceController } from './sessions/api/device.controller';
import { DeviceService } from './sessions/application/device.service';
import { DeviceQueryRepository } from './sessions/infrastructure/device.query.repository';
import { CommentService } from './comments/application/comment.service';
import {
  CommentsRepository,
  CommentsSQLRepository,
} from './comments/infractructure/comments.repository';
import { PostLike, PostLikeSchema } from './posts/domain/post-like.schema';
import {
  CommentLike,
  CommentLikeSchema,
} from './comments/domain/comment-like.schema';
import { BlogExistsRule } from './posts/validators/custom-blogId.validator';
import { BloggerController } from './blogs/api/blogger.controller';
import { SaBlogController } from './blogs/api/sa-blog.controller';
import { SaUsersController } from './users/api/sa-users.controller';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog-use-case';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog-use-case';
// import { BindBlogUseCase } from './blogs/application/use-cases/bind-blog-use-case';
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
import {
  TestingRepository,
  TestingSQLRepository,
  TestingTypeORMRepository,
} from './testing/testing.repository';
import { LoginExistsRule } from './users/validators/custom-login-exists.validator';
import { EmailExistsRule } from './users/validators/custom-email-exists.validator';
import { UsersTypeORMRepository } from './users/infrastructure/users.typeorm.repo';
import { UsersQueryTypeormRepoQueryRepository } from './users/infrastructure/users.query.typeorm.repo';
import {
  entities,
  optionsSQL,
  optionsTypeORM,
} from './configuration/optionsDB';
import { UsersSQLRepository } from './users/infrastructure/users-sql.repository';
import { DeviceSQLRepository } from './sessions/infrastructure/deviceSQL.repository';
import { DeviceSQLQueryRepository } from './sessions/infrastructure/deviceSQL.query.repository';
import { DeviceTypeOrmRepository } from './sessions/infrastructure/deviceTypeOrm.repository';
import { DeviceTypeOrmQueryRepository } from './sessions/infrastructure/deviceTypeOrm.query.repository';
import { BlogsSQLRepository } from './blogs/infrastructure/blogsSQL.repository';
import { BlogsSQLQueryRepository } from './blogs/infrastructure/blogsSQL.query.repository';
import { BlogsTypeOrmRepository } from './blogs/infrastructure/blogsTypeORM.repository';
import { BlogsTypeORMQueryRepository } from './blogs/infrastructure/blogsTypeORM.query.repository';
import { PostsSQLQueryRepository } from './posts/infrastructure/postsSQL.query.repository';
import { PostsSQLRepository } from './posts/infrastructure/postsSQL.repository';

const useCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  // BindBlogUseCase,
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
    TypeOrmModule.forRootAsync(
      process.env.REPO_TYPE === 'SQL' ? optionsSQL : optionsTypeORM,
    ),
    TypeOrmModule.forFeature(entities),
    MongooseModule.forRootAsync({
      imports: [configModule],
      useFactory: (configService: ConfigService<ConfigType>) => ({
        uri: configService.get('mongoUri'),
      }),
      inject: [ConfigService],
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
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    JwtModule.registerAsync({
      imports: [configModule],
      useFactory: (configService: ConfigService<ConfigType>) => ({
        secret: configService.get('jwt.secretAT', { infer: true }),
        signOptions: { expiresIn: '10s' },
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [configModule],
      useFactory: (configService: ConfigService<ConfigType>) => ({
        secret: configService.get('jwt.secretRT', { infer: true }),
        signOptions: { expiresIn: '20s' },
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
          : process.env.REPO_TYPE === 'SQL'
          ? BlogsSQLRepository
          : BlogsTypeOrmRepository,
    },
    {
      provide: UsersRepository,
      useClass:
        process.env.REPO_TYPE === 'MONGO'
          ? UsersRepository
          : process.env.REPO_TYPE === 'SQL'
          ? UsersSQLRepository
          : UsersTypeORMRepository,
    },
    {
      provide: UsersQueryRepository,
      useClass:
        process.env.REPO_TYPE === 'MONGO'
          ? UsersQueryRepository
          : process.env.REPO_TYPE === 'SQL'
          ? UsersSQLQueryRepository
          : UsersQueryTypeormRepoQueryRepository,
    },
    {
      provide: DeviceRepository,
      useClass:
        process.env.REPO_TYPE === 'MONGO'
          ? DeviceRepository
          : process.env.REPO_TYPE === 'SQL'
          ? DeviceSQLRepository
          : DeviceTypeOrmRepository,
    },
    {
      provide: DeviceQueryRepository,
      useClass:
        process.env.REPO_TYPE === 'MONGO'
          ? DeviceQueryRepository
          : process.env.REPO_TYPE === 'SQL'
          ? DeviceSQLQueryRepository
          : DeviceTypeOrmQueryRepository,
    },
    {
      provide: TestingRepository,
      useClass:
        process.env.REPO_TYPE === 'MONGO'
          ? TestingRepository
          : process.env.REPO_TYPE === 'SQL'
          ? TestingSQLRepository
          : TestingTypeORMRepository,
    },
    {
      provide: BlogsQueryRepository,
      useClass:
        process.env.REPO_TYPE === 'MONGO'
          ? BlogsQueryRepository
          : process.env.REPO_TYPE === 'SQL'
          ? BlogsSQLQueryRepository
          : BlogsTypeORMQueryRepository,
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
    {
      provide: CommentsRepository,
      useClass:
        process.env.REPO_TYPE === 'MONGO'
          ? CommentsRepository
          : CommentsSQLRepository,
    },
    {
      provide: CommentsQueryRepository,
      useClass:
        process.env.REPO_TYPE === 'MONGO'
          ? CommentsQueryRepository
          : CommentsSQLQueryRepository,
    },
    PostsService,
    AuthService,
    EmailAdapter,
    EmailManagers,
    BasicStrategy,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    DeviceService,
    CommentService,
    BlogExistsRule,
    LoginExistsRule,
    EmailExistsRule,
    BcryptAdapter,
    ...useCases,
  ],
})
export class AppModule {}
