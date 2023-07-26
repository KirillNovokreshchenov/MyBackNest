import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../blogs/domain/blog.schema';
import { Post, PostDocument, PostModelType } from '../domain/post.schema';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}
  async findBlogName(blogId: Types.ObjectId): Promise<string | null> {
    const blog = await this.BlogModel.findById(blogId).lean();
    if (!blog) return null;
    return blog.name;
  }

  async savePost(newPost: PostDocument) {
    await newPost.save();
  }

  async findPostDocument(postId: Types.ObjectId): Promise<PostDocument | null> {
    return this.PostModel.findById(postId);
  }

  async deletePost(postId: Types.ObjectId): Promise<boolean> {
    const res = await this.PostModel.deleteOne(postId);
    return res.deletedCount === 1;
  }
}
