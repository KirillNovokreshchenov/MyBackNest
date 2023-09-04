import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { BlogsService } from '../application/blogs.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BlogQueryInputType } from './input-model/BlogQueryInputType';
import { BlogViewModelAll } from './view-model/BlogViewModelAll';
import { CreateBlogDto } from '../application/dto/CreateBlogDto';
import { BlogViewModel } from './view-model/BlogViewModel';
import { CurrentUserId } from '../../auth/decorators/create-param-current-id.decarator';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from '../../pipes-global/parse-object-id-pipe.service';
import { UpdateBlogDto } from '../application/dto/UpdateBlogDto';
import { CreatePostForBlogDto } from '../application/dto/CreatePostForBlogDto';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { QueryInputType } from '../../models/QueryInputType';
import { PostViewModelAll } from '../../posts/api/view-models/PostViewModelAll';
import { UpdatePostDto } from '../../posts/application/dto/UpdatePostDto';
import { BlogPostIdInputType } from './input-model/BlogPostIdInputType';
import { switchError } from '../../helpers/switch-error';
import { RESPONSE_OPTIONS } from '../../models/ResponseOptionsEnum';
import { CommentsQueryRepository } from '../../comments/infractructure/comments.query.repository';
import { BanUserForBlogDto } from '../../users/application/dto/BanuserForBlogDto';
import { UsersService } from '../../users/application/users.service';
import { UserQueryInputType } from '../../users/api/input-model/UserQueryInputType';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { CreateBlogCommand } from '../application/use-cases/create-blog-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateBlogCommand } from '../application/use-cases/update-blog-use-case';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog-use-case';
import { UserBanForBlogCommand } from '../../users/application/use-cases/user-ban-for-blog-use-case';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post-use-case';
import { UpdatePostCommand } from '../../posts/application/use-cases/update-post-use-case';
import { DeletePostCommand } from '../../posts/application/use-cases/delete-post-use-case';

@Controller('blogger')
@UseGuards(JwtAuthGuard)
export class BloggerController {
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
  @Get('/blogs')
  async findAllBlogs(
    @Query() dataQuery: BlogQueryInputType,
    @CurrentUserId() userId: Types.ObjectId,
  ): Promise<BlogViewModelAll> {
    return this.blogsQueryRepository.findAllBlogs(dataQuery, userId);
  }
  @Get('/blogs/comments')
  async findAllCommentsForBlogs(
    @Query() dataQuery: BlogQueryInputType,
    @CurrentUserId() userId: Types.ObjectId,
  ) {
    return await this.queryCommentsRepo.findAllCommentsForBlogs(
      dataQuery,
      userId,
    );
  }
  @Get('users/blog/:id')
  async findBannedUsers(
    @Query() dataQuery: UserQueryInputType,
    @Param('id', ParseObjectIdPipe) blogId: Types.ObjectId,
    @CurrentUserId() userId: Types.ObjectId,
  ) {
    const bannedUsers = await this.queryUsersRepo.findBannedUsersForBlogs(
      dataQuery,
      blogId,
      userId,
    );
    if (bannedUsers === RESPONSE_OPTIONS.NOT_FOUND) {
      throw new NotFoundException();
    }
    if (bannedUsers === RESPONSE_OPTIONS.FORBIDDEN) {
      throw new ForbiddenException();
    }
    return bannedUsers;
  }
  @Post('/blogs')
  async createBlog(
    @Body() dto: CreateBlogDto,
    @CurrentUserId() userId: Types.ObjectId,
  ): Promise<BlogViewModel> {
    const blogId = await this.commandBus.execute(
      new CreateBlogCommand(dto, userId),
    );
    new HttpException('server error', HttpStatus.INTERNAL_SERVER_ERROR);
    if (!blogId) {
      throw new HttpException('server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const newBlog = await this.blogsQueryRepository.findBlog(blogId);
    if (!newBlog) {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return newBlog;
  }
  @Put('/blogs/:id')
  async updateBlog(
    @Param('id', ParseObjectIdPipe) blogId: Types.ObjectId,
    @Body() dto: UpdateBlogDto,
    @CurrentUserId() userId: Types.ObjectId,
  ) {
    const blogIsUpdate = await this.commandBus.execute(
      new UpdateBlogCommand(blogId, userId, dto),
    );
    switchError(blogIsUpdate);
  }
  @Put('users/:id/ban')
  async userBanForBlog(
    @Param('id', ParseObjectIdPipe) userId: Types.ObjectId,
    @CurrentUserId() userOwnerBlogId: Types.ObjectId,
    @Body() banDto: BanUserForBlogDto,
  ) {
    const isBanned = await this.commandBus.execute(
      new UserBanForBlogCommand(userId, userOwnerBlogId, banDto),
    );
    switchError(isBanned);
  }
  @Delete('/blogs/:id')
  async deleteBlog(
    @Param('id', ParseObjectIdPipe) blogId: Types.ObjectId,
    @CurrentUserId() userId: Types.ObjectId,
  ) {
    const blogIsDeleted = await this.commandBus.execute(
      new DeleteBlogCommand(blogId, userId),
    );
    switchError(blogIsDeleted);
  }
  @Post('/blogs/:id/posts')
  async createPostForBlog(
    @Param('id') blogId: string,
    @Body() dto: CreatePostForBlogDto,
    @CurrentUserId() userId: Types.ObjectId,
  ) {
    const postId = await this.commandBus.execute(
      new CreatePostCommand({ ...dto, blogId }, userId),
    );
    if (postId === RESPONSE_OPTIONS.NOT_FOUND) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    } else if (postId === RESPONSE_OPTIONS.FORBIDDEN) {
      throw new ForbiddenException();
    } else {
      const newPost = await this.queryPostsRepository.findPost(postId);
      if (!newPost)
        throw new HttpException(
          'INTERNAL SERVERERROR',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      return newPost;
    }
  }
  @Get('/blogs/:id/posts')
  async findAllPostsForBlog(
    @Param('id', ParseObjectIdPipe) blogId: Types.ObjectId,
    @Query() dataQuery: QueryInputType,
    @CurrentUserId() userId?: Types.ObjectId,
  ): Promise<PostViewModelAll> {
    const blog = await this.blogsQueryRepository.findBlog(blogId);
    if (!blog) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    return await this.queryPostsRepository.findAllPost(dataQuery, {
      userId,
      blogId,
    });
  }

  @Put('/blogs/:blogId/posts/:postId')
  async updatePost(
    @Param(ParseObjectIdPipe) PostAndBlogId: BlogPostIdInputType,
    @Body() postDto: UpdatePostDto,
    @CurrentUserId() userId: Types.ObjectId,
  ) {
    const isUpdate = await this.commandBus.execute(
      new UpdatePostCommand(PostAndBlogId, userId, postDto),
    );
    switchError(isUpdate);
  }
  @Delete('/blogs/:blogId/posts/:postId')
  async deletePost(
    @Param(ParseObjectIdPipe) PostAndBlogId: BlogPostIdInputType,
    @CurrentUserId() userId: Types.ObjectId,
  ) {
    const isDeleted = await this.commandBus.execute(
      new DeletePostCommand(PostAndBlogId, userId),
    );
    switchError(isDeleted);
  }
}
