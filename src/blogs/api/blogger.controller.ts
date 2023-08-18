import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
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

@Controller('blogger/blogs')
@UseGuards(JwtAuthGuard)
export class BloggerController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private blogsService: BlogsService,
    private postsService: PostsService,
    private queryPostsRepository: PostsQueryRepository,
  ) {}
  @Get()
  async findAllBlogs(
    @Query() dataQuery: BlogQueryInputType,
  ): Promise<BlogViewModelAll> {
    return await this.blogsQueryRepository.findAllBlogs(dataQuery);
  }
  @Post()
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
  @Put('/:id')
  async updateBlog(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateBlogDto,
  ) {
    const blogIsUpdate = await this.blogsService.updateBlog(id, dto);

    if (!blogIsUpdate)
      throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);

    throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  }
  @Delete('/:id')
  async deleteBlog(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    const blogIsDeleted = await this.blogsService.deleteBlog(id);
    if (!blogIsDeleted)
      throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);
    throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  }
  @Post('/:id/posts')
  async createPostForBlog(
    @Param('id') blogId: string,
    @Body() dto: CreatePostForBlogDto,
    @CurrentUserId() userId: Types.ObjectId,
  ) {
    const postId = await this.postsService.createPost(
      { ...dto, blogId },
      userId,
    );
    if (!postId) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    const newPost = await this.queryPostsRepository.findPost(postId);
    if (!newPost)
      throw new HttpException(
        'INTERNAL SERVERERROR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return newPost;
  }
  @Get('/:id/posts')
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

  @Put('/:blogId/posts/:postId')
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
  @Delete('/:blogId/posts/:postId')
  async deletePost(
    @Param(ParseObjectIdPipe) PostAnBlogId: BlogPostIdInputType,
    @CurrentUserId() userId: Types.ObjectId,
  ) {
    const isDeleted = await this.postsService.deletePost(PostAnBlogId, userId);
    switchError(isDeleted);
  }
}
