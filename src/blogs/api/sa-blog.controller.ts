import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { ParseObjectIdPipe } from '../../pipes-global/parse-object-id-pipe.service';
import { BlogsService } from '../application/blogs.service';
import { BlogQueryInputType } from './input-model/BlogQueryInputType';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { BlogViewModelAll } from './view-model/BlogViewModelAll';
import { UsersService } from '../../users/application/users.service';
import { CommandBus } from '@nestjs/cqrs';
import { IdType } from '../../models/IdType';
import {
  CurrentUserId,
  ParseCurrentIdDecorator,
} from '../../auth/decorators/create-param-current-id.decarator';
import { isError, RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { CreateBlogDto } from '../application/dto/CreateBlogDto';
import { BlogViewModel } from './view-model/BlogViewModel';
import { CreateBlogCommand } from '../application/use-cases/create-blog-use-case';
import { UpdateBlogDto } from '../application/dto/UpdateBlogDto';
import { UpdateBlogCommand } from '../application/use-cases/update-blog-use-case';
import { switchError } from '../../helpers/switch-error';
import { BanUserForBlogDto } from '../../users/application/dto/BanuserForBlogDto';
import { UserBanForBlogCommand } from '../../users/application/use-cases/user-ban-for-blog-use-case';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog-use-case';
import { CreatePostForBlogDto } from '../application/dto/CreatePostForBlogDto';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post-use-case';
import { QueryInputType } from '../../models/QueryInputType';
import { PostViewModelAll } from '../../posts/api/view-models/PostViewModelAll';
import { UpdatePostDto } from '../../posts/application/dto/UpdatePostDto';
import { UpdatePostCommand } from '../../posts/application/use-cases/update-post-use-case';
import { DeletePostCommand } from '../../posts/application/use-cases/delete-post-use-case';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { CommentsQueryRepository } from '../../comments/infractructure/comments.query.repository';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { Types } from 'mongoose';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';

@Controller('sa')
@UseGuards(BasicAuthGuard)
export class SaBlogController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private blogsService: BlogsService,
    private usersService: UsersService,
    private postsService: PostsService,
    private queryPostsRepository: PostsQueryRepository,
    private queryCommentsRepo: CommentsQueryRepository,
    private queryUsersRepo: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

  // @Get()
  // async findAllBlogsByAdmin(
  //   @Query() dataQuery: BlogQueryInputType,
  // ): Promise<BlogViewModelAll> {
  //   return await this.blogsQueryRepository.findAllBlogsByAdmin(dataQuery);
  // }
  // @Put('/:id/ban')
  // async banBlog(
  //   @Param('id', ParseObjectIdPipe) blogId: IdType,
  //   @Body() banBlogDto: BanBlogDto,
  // ) {
  //   const isBanned = await this.commandBus.execute(
  //     new BanBlogCommand(blogId, banBlogDto),
  //   );
  //   if (!isBanned) throw new NotFoundException();
  //   throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  // }
  // @Post('/:blogId/bind-with-user/:userId')
  // async bindBlog(@Param(ParseObjectIdPipe) blogAndUserId: BlogUserIdInputType) {
  //   const isBind = await this.commandBus.execute(
  //     new BindBlogCommand(blogAndUserId),
  //   );
  //   if (!isBind) {
  //     throw new BadRequestException([
  //       { field: 'Param', message: 'Incorrect Id' },
  //     ]);
  //   } else {
  //     throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  //   }
  // }
  @Get('/blogs')
  async findAllBlogs(
    @Query() dataQuery: BlogQueryInputType,
    @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  ): Promise<BlogViewModelAll> {
    return this.blogsQueryRepository.findAllBlogs(dataQuery, userId);
  }
  @Get('/blogs/comments')
  async findAllCommentsForBlogs(
    @Query() dataQuery: BlogQueryInputType,
    @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  ) {
    return await this.queryCommentsRepo.findAllCommentsForBlogs(
      dataQuery,
      userId,
    );
  }
  // @Get('users/blog/:id')
  // async findBannedUsers(
  //   @Query() dataQuery: UserQueryInputType,
  //   @Param('id', ParseObjectIdPipe) blogId: IdType,
  //   @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  // ) {
  //   const bannedUsers = await this.queryUsersRepo.findBannedUsersForBlogs(
  //     dataQuery,
  //     blogId,
  //     userId,
  //   );
  //   if (bannedUsers === RESPONSE_OPTIONS.NOT_FOUND) {
  //     throw new NotFoundException();
  //   }
  //   if (bannedUsers === RESPONSE_OPTIONS.FORBIDDEN) {
  //     throw new ForbiddenException();
  //   }
  //   return bannedUsers;
  // }
  @Post('/blogs')
  async createBlog(
    @Body() dto: CreateBlogDto,
    @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  ): Promise<BlogViewModel> {
    const blogId: RESPONSE_ERROR | IdType = await this.commandBus.execute(
      new CreateBlogCommand(dto, userId),
    );
    if (isError(blogId)) return switchError(blogId);
    const newBlog = await this.blogsQueryRepository.findBlog(blogId);
    if (isError(newBlog)) {
      return switchError(newBlog);
    } else {
      return newBlog;
    }
  }
  @Put('/blogs/:id')
  async updateBlog(
    @Param('id', ParseObjectIdPipe) blogId: IdType,
    @Body() updateDto: UpdateBlogDto,
    @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  ) {
    const blogIsUpdate = await this.commandBus.execute(
      new UpdateBlogCommand(blogId, userId, updateDto),
    );
    if (isError(blogIsUpdate)) return switchError(blogIsUpdate);
    throw new HttpException(RESPONSE_SUCCESS.NO_CONTENT, HttpStatus.NO_CONTENT);
  }
  @Put('users/:id/ban')
  async userBanForBlog(
    @Param('id', ParseObjectIdPipe) userId: IdType,
    @CurrentUserId(ParseCurrentIdDecorator) userOwnerBlogId: IdType,
    @Body() banDto: BanUserForBlogDto,
  ) {
    const isBanned = await this.commandBus.execute(
      new UserBanForBlogCommand(userId, userOwnerBlogId, banDto),
    );
    switchError(isBanned);
  }
  @Delete('/blogs/:id')
  async deleteBlog(
    @Param('id', ParseObjectIdPipe) blogId: IdType,
    @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  ) {
    const blogIsDeleted = await this.commandBus.execute(
      new DeleteBlogCommand(blogId, userId),
    );
    if (isError(blogIsDeleted)) return switchError(blogIsDeleted);
    throw new HttpException(RESPONSE_SUCCESS.NO_CONTENT, HttpStatus.NO_CONTENT);
  }
  @Post('/blogs/:id/posts')
  async createPostForBlog(
    @Param('id') blogId: string,
    @Body() dto: CreatePostForBlogDto,
    @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  ) {
    const postId = await this.commandBus.execute(
      new CreatePostCommand({ ...dto, blogId }, userId),
    );
    if (isError(postId)) return switchError(postId);
    const newPost = await this.queryPostsRepository.findPost(postId);
    if (isError(newPost)) return switchError(newPost);
    return newPost;
  }

  @Get('/blogs/:id/posts')
  async findAllPostsForBlog(
    @Param('id', ParseObjectIdPipe) blogId: IdType,
    @Query() dataQuery: QueryInputType,
    @CurrentUserId(ParseCurrentIdDecorator) userId?: IdType,
  ): Promise<PostViewModelAll> {
    const blog = await this.blogsQueryRepository.findBlog(blogId);
    if (isError(blog)) return switchError(blog);
    return await this.queryPostsRepository.findAllPost(dataQuery, {
      userId,
      blogId,
    });
  }

  @Put('/blogs/:blogId/posts/:postId')
  async updatePost(
    @Param('blogId', ParseObjectIdPipe) blogId: IdType,
    @Param('postId', ParseObjectIdPipe) postId: IdType,
    @Body() postDto: UpdatePostDto,
    @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  ) {
    const isUpdate = await this.commandBus.execute(
      new UpdatePostCommand(blogId, postId, userId, postDto),
    );
    if (isError(isUpdate)) return switchError(isUpdate);
    throw new HttpException(RESPONSE_SUCCESS.NO_CONTENT, HttpStatus.NO_CONTENT);
  }
  @Delete('/blogs/:blogId/posts/:postId')
  async deletePost(
    @Param('blogId', ParseObjectIdPipe) blogId: IdType,
    @Param('postId', ParseObjectIdPipe) postId: IdType,
    @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  ) {
    const isDeleted = await this.commandBus.execute(
      new DeletePostCommand(blogId, postId, userId),
    );
    if (isError(isDeleted)) return switchError(isDeleted);
    throw new HttpException(RESPONSE_SUCCESS.NO_CONTENT, HttpStatus.NO_CONTENT);
  }
}
