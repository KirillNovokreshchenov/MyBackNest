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
import { BanDto } from '../../users/application/dto/BanDto';
import { BanUserForBlogDto } from '../../users/application/dto/BanuserForBlogDto';
import { UsersService } from '../../users/application/users.service';

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
  ) {}
  @Get('/blogs')
  async findAllBlogs(
    @Query() dataQuery: BlogQueryInputType,
    @CurrentUserId() userId: Types.ObjectId,
  ): Promise<BlogViewModelAll> {
    return await this.blogsQueryRepository.findAllBlogs(dataQuery, userId);
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
  @Post('/blogs')
  async createBlog(
    @Body() dto: CreateBlogDto,
    @CurrentUserId() userId: Types.ObjectId,
  ): Promise<BlogViewModel> {
    const blogId = await this.blogsService.createBlog(dto, userId);
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
    const blogIsUpdate = await this.blogsService.updateBlog(
      blogId,
      userId,
      dto,
    );
    switchError(blogIsUpdate);
  }
  @Put('users/:id/ban')
  async userBanForBlog(
    @Param('id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Body() banDto: BanUserForBlogDto,
  ) {
    const isBanned = await this.usersService.userBanForBlog(userId, banDto);
    if (!isBanned) throw new NotFoundException();
    throw new HttpException('No content', HttpStatus.NO_CONTENT);
  }
  @Delete('/blogs/:id')
  async deleteBlog(
    @Param('id', ParseObjectIdPipe) blogId: Types.ObjectId,
    @CurrentUserId() userId: Types.ObjectId,
  ) {
    const blogIsDeleted = await this.blogsService.deleteBlog(blogId, userId);
    switchError(blogIsDeleted);
  }
  @Post('/blogs/:id/posts')
  async createPostForBlog(
    @Param('id') blogId: string,
    @Body() dto: CreatePostForBlogDto,
    @CurrentUserId() userId: Types.ObjectId,
  ) {
    const postId = await this.postsService.createPost(
      { ...dto, blogId },
      userId,
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
    @Param(ParseObjectIdPipe) PostAnBlogId: BlogPostIdInputType,
    @Body() postDto: UpdatePostDto,
    @CurrentUserId() userId: Types.ObjectId,
  ) {
    const isUpdate = await this.postsService.updatePost(
      PostAnBlogId,
      userId,
      postDto,
    );
    switchError(isUpdate);
  }
  @Delete('/blogs/:blogId/posts/:postId')
  async deletePost(
    @Param(ParseObjectIdPipe) PostAnBlogId: BlogPostIdInputType,
    @CurrentUserId() userId: Types.ObjectId,
  ) {
    const isDeleted = await this.postsService.deletePost(PostAnBlogId, userId);
    switchError(isDeleted);
  }
}
