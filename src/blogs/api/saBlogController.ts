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
import { UsersService } from '../../users/application/users.service';
import { BindBlogCommand } from '../application/use-cases/bind-blog-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { BanBlogCommand } from '../../users/application/use-cases/ban-blog-use-case';
import { IdType } from '../../models/IdType';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class SaBlogController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private usersService: UsersService,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async findAllBlogsByAdmin(
    @Query() dataQuery: BlogQueryInputType,
  ): Promise<BlogViewModelAll> {
    return await this.blogsQueryRepository.findAllBlogsByAdmin(dataQuery);
  }
  @Put('/:id/ban')
  async banBlog(
    @Param('id', ParseObjectIdPipe) blogId: IdType,
    @Body() banBlogDto: BanBlogDto,
  ) {
    const isBanned = await this.commandBus.execute(
      new BanBlogCommand(blogId, banBlogDto),
    );
    if (!isBanned) throw new NotFoundException();
    throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  }
  @Post('/:blogId/bind-with-user/:userId')
  async bindBlog(@Param(ParseObjectIdPipe) blogAndUserId: BlogUserIdInputType) {
    const isBind = await this.commandBus.execute(
      new BindBlogCommand(blogAndUserId),
    );
    if (!isBind) {
      throw new BadRequestException([
        { field: 'Param', message: 'Incorrect Id' },
      ]);
    } else {
      throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
    }
  }
}
