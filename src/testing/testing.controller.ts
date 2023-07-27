import { Controller, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../blogs/domain/blog.schema';
import { Post, PostModelType } from '../posts/domain/post.schema';
import { User, UserModelType } from '../users/domain/user.schema';
import { Comment, CommentModelType } from '../comments/domain/comment.schema';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}
  @Delete('/all-data')
  async deleteAllData() {
    const comment = this.CommentModel.deleteMany();
    const user = this.UserModel.deleteMany();
    const blog = this.BlogModel.deleteMany();
    const post = this.PostModel.deleteMany();
    await Promise.all([comment, user, blog, post]);
    throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  }
}
