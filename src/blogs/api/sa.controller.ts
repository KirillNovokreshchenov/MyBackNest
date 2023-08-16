import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { ParseObjectIdPipe } from '../../pipes-global/parse-object-id-pipe.service';
import { BlogUserIdInputType } from './input-model/BlogUserIdInputType';
import { BlogsService } from '../application/blogs.service';
import { BlogQueryInputType } from './input-model/BlogQueryInputType';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { BlogViewModelAll } from './view-model/BlogViewModelAll';

@Controller('blogs')
@UseGuards(BasicAuthGuard)
export class SaController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  async findAllBlogsByAdmin(
    @Query() dataQuery: BlogQueryInputType,
  ): Promise<BlogViewModelAll> {
    return await this.blogsQueryRepository.findAllBlogs(dataQuery);
  }
  @Post('/:blogId/bind-with-user/:userId')
  async bindBlog(@Param(ParseObjectIdPipe) blogAndUserId: BlogUserIdInputType) {
    const isBind = await this.blogsService.bindBlog(blogAndUserId);
    if (!isBind) {
      throw new BadRequestException([
        { field: 'Param', message: 'Incorrect Id' },
      ]);
    } else {
      throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
    }
  }
}
