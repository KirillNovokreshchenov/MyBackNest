import { Controller, UseGuards } from '@nestjs/common';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { BlogsService } from '../application/blogs.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { CommentsQueryRepository } from '../../comments/infractructure/comments.query.repository';
import { UsersService } from '../../users/application/users.service';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { CommandBus } from '@nestjs/cqrs';

@Controller('blogger')
@UseGuards(JwtAuthGuard)
export class BloggerController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private blogsService: BlogsService,
    private usersService: UsersService,
    private postsService: PostsService,
    private queryPostsRepository: PostsQueryRepository,
    private queryCommentsRepo: CommentsQueryRepository,
    private queryUsersRepo: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}
  // @Get('/blogs')
  // async findAllBlogs(
  //   @Query() dataQuery: BlogQueryInputType,
  //   @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  // ): Promise<BlogViewModelAll> {
  //   return this.blogsQueryRepository.findAllBlogs(dataQuery, userId);
  // }
  // @Get('/blogs/comments')
  // async findAllCommentsForBlogs(
  //   @Query() dataQuery: BlogQueryInputType,
  //   @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  // ) {
  //   console.log(userId);
  //   return await this.queryCommentsRepo.findAllCommentsForBlogs(
  //     dataQuery,
  //     userId,
  //   );
  // }
  // @Get('users/blog/:id')
  // async findBannedUsers(
  //   @Query() dataQuery: UserQueryInputType,
  //   @Param('id', ParseObjectIdPipe) blogId: IdType,
  //   @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  // ) {
  //   const bannedUsers = await this.queryUsersRepo.findBannedUsersForBlogs(
  //     dataQuery,
  //     blogId,
  //     userId,
  //   );
  //   if (bannedUsers === RESPONSE_OPTIONS.NOT_FOUND) {
  //     throw new NotFoundException();
  //   }
  //   if (bannedUsers === RESPONSE_OPTIONS.FORBIDDEN) {
  //     throw new ForbiddenException();
  //   }
  //   return bannedUsers;
  // }
  // @Post('/blogs')
  // async createBlog(
  //   @Body() dto: CreateBlogDto,
  //   @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  // ): Promise<BlogViewModel> {
  //   const blogId = await this.commandBus.execute(
  //     new CreateBlogCommand(dto, userId),
  //   );
  //   if (!blogId) {
  //     throw new HttpException('server error', HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  //   const newBlog = await this.blogsQueryRepository.findBlog(blogId);
  //   if (!newBlog) {
  //     throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  //   return newBlog;
  // }
  // @Put('/blogs/:id')
  // async updateBlog(
  //   @Param('id', ParseObjectIdPipe) blogId: IdType,
  //   @Body() dto: UpdateBlogDto,
  //   @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  // ) {
  //   const blogIsUpdate = await this.commandBus.execute(
  //     new UpdateBlogCommand(blogId, userId, dto),
  //   );
  //   switchError(blogIsUpdate);
  // }
  // @Put('users/:id/ban')
  // async userBanForBlog(
  //   @Param('id', ParseObjectIdPipe) userId: IdType,
  //   @CurrentUserId(ParseCurrentIdDecorator) userOwnerBlogId: IdType,
  //   @Body() banDto: BanUserForBlogDto,
  // ) {
  //   const isBanned = await this.commandBus.execute(
  //     new UserBanForBlogCommand(userId, userOwnerBlogId, banDto),
  //   );
  //   switchError(isBanned);
  // }
  // @Delete('/blogs/:id')
  // async deleteBlog(
  //   @Param('id', ParseObjectIdPipe) blogId: IdType,
  //   @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  // ) {
  //   const blogIsDeleted = await this.commandBus.execute(
  //     new DeleteBlogCommand(blogId, userId),
  //   );
  //   switchError(blogIsDeleted);
  // }
  // @Post('/blogs/:id/posts')
  // async createPostForBlog(
  //   @Param('id') blogId: string,
  //   @Body() dto: CreatePostForBlogDto,
  //   @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  // ) {
  //   const postId = await this.commandBus.execute(
  //     new CreatePostCommand({ ...dto, blogId }, userId),
  //   );
  //   if (postId === RESPONSE_OPTIONS.NOT_FOUND) {
  //     throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
  //   } else if (postId === RESPONSE_OPTIONS.FORBIDDEN) {
  //     throw new ForbiddenException();
  //   } else {
  //     const newPost = await this.queryPostsRepository.findPost(postId);
  //     if (!newPost)
  //       throw new HttpException(
  //         'INTERNAL SERVERERROR',
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     return newPost;
  //   }
  // }
  // @Get('/blogs/:id/posts')
  // async findAllPostsForBlog(
  //   @Param('id', ParseObjectIdPipe) blogId: IdType,
  //   @Query() dataQuery: QueryInputType,
  //   @CurrentUserId(ParseCurrentIdDecorator) userId?: IdType,
  // ): Promise<PostViewModelAll> {
  //   const blog = await this.blogsQueryRepository.findBlog(blogId);
  //   if (!blog) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
  //   return await this.queryPostsRepository.findAllPost(dataQuery, {
  //     userId,
  //     blogId,
  //   });
  // }
  //
  // @Put('/blogs/:blogId/posts/:postId')
  // async updatePost(
  //   @Param(ParseObjectIdPipe) PostAndBlogId: BlogPostIdInputType,
  //   @Body() postDto: UpdatePostDto,
  //   @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  // ) {
  //   const isUpdate = await this.commandBus.execute(
  //     new UpdatePostCommand(PostAndBlogId, userId, postDto),
  //   );
  //   switchError(isUpdate);
  // }
  // @Delete('/blogs/:blogId/posts/:postId')
  // async deletePost(
  //   @Param(ParseObjectIdPipe) PostAndBlogId: BlogPostIdInputType,
  //   @CurrentUserId(ParseCurrentIdDecorator) userId: IdType,
  // ) {
  //   const isDeleted = await this.commandBus.execute(
  //     new DeletePostCommand(PostAndBlogId, userId),
  //   );
  //   switchError(isDeleted);
  // }
}
