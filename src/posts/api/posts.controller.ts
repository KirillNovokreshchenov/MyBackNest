import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/posts.query.repository';
import { CreatePostDto } from '../application/dto/CreatePostDto';
import { PostViewModel } from './view-models/PostViewModel';
import { UpdatePostDto } from '../application/dto/UpdatePostDto';
import { Types } from 'mongoose';
import { QueryInputType } from '../../models/QueryInputType';
import { CommentsQueryRepository } from '../../comments/infractructure/comments.query.repository';
import { ParseObjectIdPipe } from '../../pipes-global/parse-object-id-pipe.service';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/decorators/create-param-current-id.decarator';
import { CreateCommentDto } from '../../comments/application/dto/CreateCommentDto';
import { CommentService } from '../../comments/application/comment.service';
import { JwtLikeAuthGuard } from '../../auth/guards/jwt-like-auth.guard';
import { LikeStatusDto } from '../../models/LikeStatusDto';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query.repository';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected queryPostsRepository: PostsQueryRepository,
    protected queryCommentsRepository: CommentsQueryRepository,
    protected queryBlogRepo: BlogsQueryRepository,
    protected commentService: CommentService,
  ) {}
  @UseGuards(JwtLikeAuthGuard)
  @Get()
  async findAllPost(
    @Query() dataQuery: QueryInputType,
    @CurrentUserId() userId?: Types.ObjectId,
  ) {
    return await this.queryPostsRepository.findAllPost(dataQuery, { userId });
  }
  @UseGuards(JwtLikeAuthGuard)
  @Get('/:id')
  async findPost(
    @Param('id', ParseObjectIdPipe) postId: Types.ObjectId,
    @CurrentUserId() userId?: Types.ObjectId,
  ) {
    const post = await this.queryPostsRepository.findPost(postId, userId);
    if (!post) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    return post;
  }
  @UseGuards(JwtLikeAuthGuard)
  @Get('/:id/comments')
  async findCommentsForPost(
    @Param('id', ParseObjectIdPipe) postId: Types.ObjectId,
    @Query() dataQuery: QueryInputType,
    @CurrentUserId() userId?: Types.ObjectId,
  ) {
    const post = await this.queryPostsRepository.findPost(postId);
    if (!post) throw new NotFoundException();
    return await this.queryCommentsRepository.findAllComments(
      dataQuery,
      postId,
      userId,
    );
  }
  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() dto: CreatePostDto): Promise<PostViewModel> {
    const postId = await this.postsService.createPost(dto);
    if (!postId)
      throw new BadRequestException([
        { message: 'incorrect blogId', field: 'blogId' },
      ]);
    const newPost = await this.queryPostsRepository.findPost(postId);
    if (!newPost)
      throw new HttpException(
        'INTERNAL SERVERERROR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return newPost;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:id/comments')
  async createCommentForPost(
    @CurrentUserId() userId: Types.ObjectId,
    @Param('id', ParseObjectIdPipe) postId: Types.ObjectId,
    @Body() commentDto: CreateCommentDto,
  ) {
    const commentId = await this.commentService.createComment(
      userId,
      postId,
      commentDto,
    );
    if (!commentId) throw new NotFoundException();
    return this.queryCommentsRepository.findComment(commentId);
  }

  // @UseGuards(BasicAuthGuard)
  // @Put('/:id')
  // async updatePost(
  //   @Param('id', ParseObjectIdPipe) postId: Types.ObjectId,
  //   @Body() dto: UpdatePostDto,
  // ) {
  //   const blog = this.queryBlogRepo.findBlog(new Types.ObjectId(dto.blogId));
  //   if (!blog) {
  //     throw new BadRequestException([
  //       { message: 'incorrect blogId', field: 'blogId' },
  //     ]);
  //   }
  //   const isUpdate = await this.postsService.updatePost(postId, dto);
  //   if (!isUpdate) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
  //   throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  // }
  @UseGuards(JwtAuthGuard)
  @Put('/:id/like-status')
  async updateLikeStatus(
    @Param('id', ParseObjectIdPipe) postId: Types.ObjectId,
    @CurrentUserId() userId: Types.ObjectId,
    @Body() likeStatusDto: LikeStatusDto,
  ) {
    const likeStatus = await this.postsService.updateLikeStatus(
      userId,
      postId,
      likeStatusDto,
    );
    if (!likeStatus) throw new NotFoundException();
    throw new HttpException('No content', HttpStatus.NO_CONTENT);
  }

  // @UseGuards(BasicAuthGuard)
  // @Delete('/:id')
  // async deletePost(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
  //   const isDeleted = await this.postsService.deletePost(id);
  //   if (!isDeleted) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
  //   throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  // }
}
