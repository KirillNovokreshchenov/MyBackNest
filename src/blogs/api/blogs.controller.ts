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
} from '@nestjs/common';
import { CreateBlogDto } from '../application/dto/CreateBlogDto';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { BlogViewModel } from './view-model/BlogViewModel';
import { Types } from 'mongoose';
import { BlogQueryInputType } from './input-model/BlogQueryInputType';
import { UpdateBlogDto } from '../application/dto/UpdateBlogDto';
import { CreatePostDto } from '../../posts/application/dto/CreatePostDto';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { QueryInputType } from '../../models/QueryInputType';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsService: PostsService,
    protected queryPostsRepository: PostsQueryRepository,
  ) {}

  @Get()
  async findAllBlogs(@Query() dataQuery: BlogQueryInputType) {
    return await this.blogsQueryRepository.findAllBlogs(dataQuery);
  }
  @Get('/:id')
  async findBlogById(@Param('id') id: string): Promise<BlogViewModel> {
    const findBlog = await this.blogsQueryRepository.findBlog(
      new Types.ObjectId(id),
    );
    if (!findBlog) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return findBlog;
  }

  @Get('/:id/posts')
  async findAllPostsForBlog(
    @Param('id') id: string,
    @Query() dataQuery: QueryInputType,
  ) {
    const blog = await this.blogsQueryRepository.findBlog(
      new Types.ObjectId(id),
    );

    if (!blog) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    return await this.queryPostsRepository.findAllPost(
      dataQuery,
      new Types.ObjectId(id),
    );
  }
  @Post()
  async createBlog(@Body() dto: CreateBlogDto): Promise<BlogViewModel> {
    const blogId = await this.blogsService.createBlog(dto);
    const newBlog = await this.blogsQueryRepository.findBlog(blogId);
    if (!newBlog) {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return newBlog;
  }
  @Post('/:id/posts')
  async createPostForBlog(
    @Param('id') blogId: string,
    @Body() dto: CreatePostDto,
  ) {
    dto.blogId = blogId;
    const postId = await this.postsService.createPost(dto);
    if (!postId) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    const newPost = await this.queryPostsRepository.findPost(postId);
    if (!newPost)
      throw new HttpException(
        'INTERNAL SERVERERROR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return newPost;
  }
  @Put('/:id')
  async updateBlog(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    const blogIsUpdate = await this.blogsService.updateBlog(
      new Types.ObjectId(id),
      dto,
    );

    if (!blogIsUpdate)
      throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);

    throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  }

  @Delete('/:id')
  async deleteBlog(@Param('id') id: string) {
    const blogIsDeleted = await this.blogsService.deleteBlog(
      new Types.ObjectId(id),
    );
    if (!blogIsDeleted)
      throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);
    throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  }
}
