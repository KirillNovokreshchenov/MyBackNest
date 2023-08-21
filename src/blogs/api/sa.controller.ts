import {
  BadRequestException,
  Body,
  Controller,
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
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { ParseObjectIdPipe } from '../../pipes-global/parse-object-id-pipe.service';
import { BlogUserIdInputType } from './input-model/BlogUserIdInputType';
import { BlogsService } from '../application/blogs.service';
import { BlogQueryInputType } from './input-model/BlogQueryInputType';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { BlogViewModelAll } from './view-model/BlogViewModelAll';
import { BanBlogDto } from '../application/dto/BanBlogDto';
import { Types } from 'mongoose';
import { UsersService } from '../../users/application/users.service';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class SaController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private usersService: UsersService,
  ) {}

  @Get()
  async findAllBlogsByAdmin(
    @Query() dataQuery: BlogQueryInputType,
  ): Promise<BlogViewModelAll> {
    return await this.blogsQueryRepository.findAllBlogsByAdmin(dataQuery);
  }
  @Put('/:id/ban')
  async banBlog(
    @Param('id', ParseObjectIdPipe) blogId: Types.ObjectId,
    @Body() banBlogDto: BanBlogDto,
  ) {
    const isBanned = await this.usersService.banBlog(blogId, banBlogDto);
    if (!isBanned) throw new NotFoundException();
    throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
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
