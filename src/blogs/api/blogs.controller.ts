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

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  async findAllBlogs(@Query() dataQuery: BlogQueryInputType) {
    const blogs = await this.blogsQueryRepository.findAllBlogs(dataQuery);
    return blogs;
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
  @Post()
  async createBlog(@Body() dto: CreateBlogDto): Promise<BlogViewModel> {
    const blogId = await this.blogsService.createBlog(dto);
    const newBlog = await this.blogsQueryRepository.findBlog(blogId);
    if (!newBlog) {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return newBlog;
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
