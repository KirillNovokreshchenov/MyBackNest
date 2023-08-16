import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/CreateBlogDto';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.schema';
import { Types } from 'mongoose';
import { UpdateBlogDto } from './dto/UpdateBlogDto';
import { Post, PostModelType } from '../../posts/domain/post.schema';

@Injectable()
export class BlogsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {}

  async createBlog(
    blogDto: CreateBlogDto,
    userId: Types.ObjectId,
  ): Promise<Types.ObjectId | null> {
    const foundUser = await this.blogsRepository.findUserForBlog(userId);
    if (!foundUser) return null;
    const newBlog = this.BlogModel.createNewBlog(
      blogDto,
      userId,
      foundUser.login,
      this.BlogModel,
    );
    await this.blogsRepository.saveBlog(newBlog);
    return newBlog._id;
  }

  async updateBlog(
    blogId: Types.ObjectId,
    blogDto: UpdateBlogDto,
  ): Promise<boolean> {
    const blog: BlogDocument | null = await this.blogsRepository.findBlogById(
      blogId,
    );
    if (!blog) return false;

    const posts = await this.blogsRepository.findPostsByBlogName(blog.name);
    this.PostModel.changeBlogName(posts, blogDto.name);

    await blog.updateBlog(blogDto);
    await this.blogsRepository.saveBlog(blog);
    return true;
  }

  async deleteBlog(blogId: Types.ObjectId): Promise<boolean> {
    const isDeleted = await this.blogsRepository.deleteBlog(blogId);
    return isDeleted;
  }
}
