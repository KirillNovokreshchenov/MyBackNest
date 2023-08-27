import { Types } from 'mongoose';
import { BanBlogDto } from '../../../blogs/application/dto/BanBlogDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../../comments/infractructure/comments.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class BanBlogCommand {
  constructor(public blogId: Types.ObjectId, public banBlogDto: BanBlogDto) {}
}
@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
  constructor(
    private postRepo: PostsRepository,
    private commentsRepo: CommentsRepository,
    private blogsRepo: BlogsRepository,
  ) {}
  async execute(command: BanBlogCommand) {
    const blog = await this.blogsRepo.findBlogById(command.blogId);
    if (!blog) return false;
    blog.banUnbanBlog(command.banBlogDto);
    await this.blogsRepo.saveBlog(blog);
    await this._banUnbanBlogPosts(command.blogId);
    await this._banUnbanBlogComments(command.blogId);
    return true;
  }
  async _banUnbanBlogPosts(blogId: Types.ObjectId) {
    const posts = await this.postRepo.findPostsBlogBan(blogId);
    posts.map((post) => {
      post.isBannedPost();
      this.postRepo.savePost(post);
    });
  }
  async _banUnbanBlogComments(blogId: Types.ObjectId) {
    const comments = await this.commentsRepo.findCommentsBlogBan(blogId);
    comments.map((comment) => {
      comment.isBannedComment();
      this.commentsRepo.saveComment(comment);
    });
  }
}
