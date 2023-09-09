import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.schema';
import { Post, PostModelType } from '../../posts/domain/post.schema';

@Injectable()
export class BlogsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {}

  // async createBlog(
  //   blogDto: CreateBlogDto,
  //   userId: Types.ObjectId,
  // ): Promise<Types.ObjectId | null> {
  //   const foundUser = await this.blogsRepository.findUserForBlog(userId);
  //   if (!foundUser) return null;
  //   const newBlog = this.BlogModel.createNewBlog(
  //     blogDto,
  //     userId,
  //     foundUser.login,
  //     this.BlogModel,
  //   );
  //   await this.blogsRepository.saveBlog(newBlog);
  //   return newBlog._id;
  // }

  // async updateBlog(
  //   blogId: Types.ObjectId,
  //   userId: Types.ObjectId,
  //   blogDto: UpdateBlogDto,
  // ): Promise<RESPONSE_OPTIONS> {
  //   const blog: BlogDocument | null = await this.blogsRepository.findBlogById(
  //     blogId,
  //   );
  //   console.log(blog);
  //   if (!blog) return RESPONSE_OPTIONS.NOT_FOUND;
  //   if (blog.blogOwnerInfo.userId.toString() !== userId.toString())
  //     return RESPONSE_OPTIONS.FORBIDDEN;
  //
  //   const posts = await this.blogsRepository.findPostsByBlogName(blog.name);
  //   this.PostModel.changeBlogName(posts, blogDto.name);
  //
  //   await blog.updateBlog(blogDto);
  //   await this.blogsRepository.saveBlog(blog);
  //   return RESPONSE_OPTIONS.NO_CONTENT;
  // }

  // async deleteBlog(
  //   blogId: Types.ObjectId,
  //   userId: Types.ObjectId,
  // ): Promise<RESPONSE_OPTIONS> {
  //   const blog = await this.blogsRepository.findBlogById(blogId);
  //   if (!blog) return RESPONSE_OPTIONS.NOT_FOUND;
  //   if (blog.blogOwnerInfo.userId.toString() !== userId.toString())
  //     return RESPONSE_OPTIONS.FORBIDDEN;
  //
  //   await this.blogsRepository.deleteBlog(blogId);
  //   return RESPONSE_OPTIONS.NO_CONTENT;
  // }

  // async bindBlog(blogAndUserId: BlogUserIdInputType) {
  //   const blog = await this.blogsRepository.findBlogById(blogAndUserId.blogId);
  //   if (!blog) return false;
  //   const user = await this.blogsRepository.findUserForBlog(
  //     blogAndUserId.userId,
  //   );
  //   if (!user) return false;
  //   if (!blog.blogOwnerInfo) {
  //     return false;
  //   } else {
  //     blog.bindUser(user._id, user.login);
  //     return true;
  //   }
  // }
}
