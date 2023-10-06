import {
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
import { PostsQueryRepository } from '../infrastructure/posts.query.repository';
import { QueryInputType } from '../../models/QueryInputType';
import { CommentsQueryRepository } from '../../comments/infractructure/comments.query.repository';
import { ParseObjectIdPipe } from '../../pipes-global/parse-object-id-pipe.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  CurrentUserId,
  ParseCurrentIdDecorator,
} from '../../auth/decorators/create-param-current-id.decarator';
import { CreateCommentDto } from '../../comments/application/dto/CreateCommentDto';
import { JwtLikeAuthGuard } from '../../auth/guards/jwt-like-auth.guard';
import { LikeStatusDto } from '../../models/LikeStatusDto';
import { isError } from '../../models/RESPONSE_ERROR';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateLikeStatusPostCommand } from '../application/use-cases/update-like-status-post-use-case';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment-use-case';
import { IdType } from '../../models/IdType';
import { switchError } from '../../helpers/switch-error';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';

@Controller('posts')
export class PostsController {
  constructor(
    protected queryPostsRepository: PostsQueryRepository,
    protected queryCommentsRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}
  @UseGuards(JwtLikeAuthGuard)
  @Get()
  async findAllPost(
    @Query() dataQuery: QueryInputType,
    @CurrentUserId(ParseCurrentIdDecorator) userId?: IdType,
  ) {
    return await this.queryPostsRepository.findAllPost(dataQuery, { userId });
  }
  @UseGuards(JwtLikeAuthGuard)
  @Get('/:id')
  async findPost(
    @Param('id', ParseObjectIdPipe) postId: IdType,
    @CurrentUserId(ParseCurrentIdDecorator) userId?: IdType,
  ) {
    const post = await this.queryPostsRepository.findPost(postId, userId);
    if (isError(post)) return switchError(post);
    return post;
  }
  @UseGuards(JwtLikeAuthGuard)
  @Get('/:id/comments')
  async findCommentsForPost(
    @Param('id', ParseObjectIdPipe) postId: IdType,
    @Query() dataQuery: QueryInputType,
    @CurrentUserId(ParseCurrentIdDecorator) userId?: IdType,
  ) {
    const post = await this.queryPostsRepository.findPost(postId);
    if (isError(post)) return switchError(post);
    return this.queryCommentsRepository.findAllComments(
      dataQuery,
      postId,
      userId,
    );
  }
  // @UseGuards(BasicAuthGuard)
  // @Post()
  // async createPost(@Body() dto: CreatePostDto): Promise<PostViewModel> {
  //   const postId = await this.postsService.createPost(dto);
  //   if (!postId)
  //     throw new BadRequestException([
  //       { message: 'incorrect blogId', field: 'blogId' },
  //     ]);
  //   const newPost = await this.queryPostsRepository.findPost(postId);
  //   if (!newPost)
  //     throw new HttpException(
  //       'INTERNAL SERVERERROR',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   return newPost;
  // }

  @UseGuards(JwtAuthGuard)
  @Post('/:id/comments')
  async createCommentForPost(
    @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
    @Param('id', ParseObjectIdPipe) postId: IdType,
    @Body() commentDto: CreateCommentDto,
  ) {
    const commentId = await this.commandBus.execute(
      new CreateCommentCommand(userId, postId, commentDto),
    );
    // if (commentId === RESPONSE_OPTIONS.NOT_FOUND) throw new NotFoundException();
    // if (commentId === RESPONSE_OPTIONS.FORBIDDEN)
    //   throw new ForbiddenException();
    if (isError(commentId)) return switchError(commentId);
    const foundComment = await this.queryCommentsRepository.findComment(
      commentId,
    );
    if (isError(foundComment)) return switchError(foundComment);
    return foundComment;
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
    @Param('id', ParseObjectIdPipe) postId: IdType,
    @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
    @Body() likeStatusDto: LikeStatusDto,
  ) {
    const likeStatus = await this.commandBus.execute(
      new UpdateLikeStatusPostCommand(userId, postId, likeStatusDto),
    );
    if (isError(likeStatus)) return switchError(likeStatus);
    throw new HttpException(RESPONSE_SUCCESS.NO_CONTENT, HttpStatus.NO_CONTENT);
  }

  // @UseGuards(BasicAuthGuard)
  // @Delete('/:id')
  // async deletePost(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
  //   const isDeleted = await this.postsService.deletePost(id);
  //   if (!isDeleted) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
  //   throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  // }
}
