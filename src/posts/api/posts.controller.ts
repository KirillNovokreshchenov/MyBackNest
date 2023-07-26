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
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/posts.query.repository';
import { CreatePostDto } from '../application/dto/CreatePostDto';
import { PostViewModel } from './view-models/PostViewModel';
import { UpdatePostDto } from '../application/dto/UpdatePostDto';
import { Types } from 'mongoose';
import { QueryInputType } from '../../models/QueryInputType';
import { CommentsQueryRepository } from '../../comments/infractructure/comments.query.repository';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected queryPostsRepository: PostsQueryRepository,
    protected queryCommentsRepository: CommentsQueryRepository,
  ) {}

  @Get()
  async findAllPost(@Query() dataQuery: QueryInputType) {
    return await this.queryPostsRepository.findAllPost(dataQuery);
  }
  @Get('/:id')
  async findPost(@Param('id') id: string) {
    return await this.queryPostsRepository.findPost(new Types.ObjectId(id));
  }

  // @Get('/:id/comments')
  // async findCommentsForPost(@Param('id') id: string) {
  //   const comments = await this.queryCommentsRepository.findAllComments(
  //     new Types.ObjectId(id),
  //   );
  // }
  @Post()
  async createPost(@Body() dto: CreatePostDto): Promise<PostViewModel> {
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
  async updatePost(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    const isUpdate = await this.postsService.updatePost(
      new Types.ObjectId(id),
      dto,
    );
    if (!isUpdate) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  }
  @Delete('/:id')
  async deletePost(@Param('id') id: string) {
    const isDeleted = await this.postsService.deletePost(
      new Types.ObjectId(id),
    );
    if (!isDeleted) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  }
}
