import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Post, PostModelType } from '../../posts/domain/post.schema';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {}

  async saveBlog(newBlog: BlogDocument) {
    await newBlog.save();
  }

  async findBlogById(blogId: Types.ObjectId): Promise<BlogDocument | null> {
    return this.BlogModel.findById(blogId);
  }
  async findPostsByBlogName(blogName: string) {
    return this.PostModel.find({ blogName });
  }

  async deleteBlog(blogId: Types.ObjectId): Promise<boolean> {
    const res = await this.BlogModel.deleteOne(blogId);
    return res.deletedCount === 1;
  }
}
