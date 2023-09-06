import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { BlogViewModel } from './view-model/BlogViewModel';
import { Types } from 'mongoose';
import { BlogQueryInputType } from './input-model/BlogQueryInputType';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { QueryInputType } from '../../models/QueryInputType';
import { PostViewModelAll } from '../../posts/api/view-models/PostViewModelAll';
import { BlogViewModelAll } from './view-model/BlogViewModelAll';
import { ParseObjectIdPipe } from '../../pipes-global/parse-object-id-pipe.service';
import { JwtLikeAuthGuard } from '../../auth/guards/jwt-like-auth.guard';
import {
  CurrentUserId,
  ParseCurrentIdDecorator,
} from '../../auth/decorators/create-param-current-id.decarator';
import { IdType } from '../../models/IdType';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsQueryRepository: BlogsQueryRepository,
    protected queryPostsRepository: PostsQueryRepository,
  ) {}

  @Get()
  async findAllBlogs(@Query() dataQuery: BlogQueryInputType) {
    return this.blogsQueryRepository.findAllBlogs(dataQuery);
  }
  @Get('/:id')
  async findBlogById(
    @Param('id', ParseObjectIdPipe) id: IdType,
  ): Promise<BlogViewModel> {
    const findBlog = await this.blogsQueryRepository.findBlog(id);
    if (!findBlog) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return findBlog;
  }
  @UseGuards(JwtLikeAuthGuard)
  @Get('/:id/posts')
  async findAllPostsForBlog(
    @Param('id', ParseObjectIdPipe) blogId: IdType,
    @Query() dataQuery: QueryInputType,
    @CurrentUserId(ParseCurrentIdDecorator) userId?: IdType,
  ): Promise<PostViewModelAll> {
    const blog = await this.blogsQueryRepository.findBlog(blogId);
    if (!blog) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    return await this.queryPostsRepository.findAllPost(dataQuery, {
      userId,
      blogId,
    });
  }
  // @UseGuards(BasicAuthGuard)
  // @Post()
  // async createBlog(@Body() dto: CreateBlogDto): Promise<BlogViewModel> {
  //   const blogId = await this.blogsService.createBlog(dto);
  //   const newBlog = await this.blogsQueryRepository.findBlog(blogId);
  //   if (!newBlog) {
  //     throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  //   return newBlog;
  // }
  // @UseGuards(BasicAuthGuard)
  // @Post('/:id/posts')
  // async createPostForBlog(
  //   @Param('id') blogId: string,
  //   @Body() dto: CreatePostForBlogDto,
  // ) {
  //   const postId = await this.postsService.createPost({ ...dto, blogId });
  //   if (!postId) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
  //   const newPost = await this.queryPostsRepository.findPost(postId);
  //   if (!newPost)
  //     throw new HttpException(
  //       'INTERNAL SERVERERROR',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   return newPost;
  // }
  // @UseGuards(BasicAuthGuard)
  // @Put('/:id')
  // async updateBlog(
  //   @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  //   @Body() dto: UpdateBlogDto,
  // ) {
  //   const blogIsUpdate = await this.blogsService.updateBlog(id, dto);
  //
  //   if (!blogIsUpdate)
  //     throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);
  //
  //   throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  // }
  // @UseGuards(BasicAuthGuard)
  // @Delete('/:id')
  // async deleteBlog(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
  //   const blogIsDeleted = await this.blogsService.deleteBlog(id);
  //   if (!blogIsDeleted)
  //     throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);
  //   throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  // }
}
