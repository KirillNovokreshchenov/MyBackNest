import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Post, PostModelType } from '../../posts/domain/post.schema';
import { User, UserModelType } from '../../users/domain/user.schema';
import { BanBlogDto } from '../application/dto/BanBlogDto';
import { IdType } from '../../models/IdType';
import { CreateBlogDto } from '../application/dto/CreateBlogDto';
import { UpdateBlogDto } from '../application/dto/UpdateBlogDto';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {}

  async saveBlog(newBlog: BlogDocument) {
    await newBlog.save();
  }

  async findBlogById(
    blogId: IdType | Types.ObjectId,
  ): Promise<BlogDocument | null> {
    return this.BlogModel.findById(blogId);
  }
  async findPostsByBlogName(blogName: string) {
    return this.PostModel.find({ blogName });
  }

  async deleteBlog(blogId: IdType): Promise<boolean> {
    const res = await this.BlogModel.deleteOne({ _id: blogId });
    return res.deletedCount === 1;
  }

  async findUserForBlog(userId: IdType) {
    const user = await this.UserModel.findById(userId);
    if (!user) return null;
    return { userId: user._id, userLogin: user.login };
  }

  async getOwnerId(blogId: string) {
    const blog = await this.findBlogById(new Types.ObjectId(blogId));
    if (!blog) return null;
    return blog.blogOwnerInfo.userId;
  }

  async bunUnbanBlog(blogId: IdType, banBlogDto: BanBlogDto) {
    const blog = await this.findBlogById(blogId);
    if (!blog) return null;
    blog.banUnbanBlog(banBlogDto);
    await this.saveBlog(blog);
  }
  async findDataBlog(blogId: string) {
    const blog = await this.findBlogById(new Types.ObjectId(blogId));
    if (!blog) return null;
    return { ownerId: blog.blogOwnerInfo.userId, blogName: blog.name };
  }

  async findOwnerId(blogId: IdType) {
    const blog = await this.findBlogById(blogId);
    if (!blog) return null;
    return blog.blogOwnerInfo.userId;
  }
  async bindBlog(blogId: IdType, userId: IdType, userLogin: string) {
    const blog = await this.findBlogById(blogId);
    if (!blog) return null;
    blog.bindUser(userId, userLogin);
    await this.saveBlog(blog);
  }
  async createBlog(userId: IdType, userLogin: string, blogDto: CreateBlogDto) {
    const newBlog = this.BlogModel.createNewBlog(
      blogDto,
      userId,
      userLogin,
      this.BlogModel,
    );
    await this.saveBlog(newBlog);
    return newBlog._id;
  }
  async updateBlog(blogId: IdType, blogDto: UpdateBlogDto) {
    const blog = await this.findBlogById(blogId);
    if (!blog) return null;
    const posts = await this.findPostsByBlogName(blog.name);
    this.PostModel.changeBlogName(posts, blogDto.name);
    await blog.updateBlog(blogDto);
    await this.saveBlog(blog);
  }
}
@Injectable()
export class BlogsSQLRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {}
}
