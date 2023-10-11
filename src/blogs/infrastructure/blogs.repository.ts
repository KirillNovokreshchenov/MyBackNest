import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../posts/domain/post.schema';
import { User, UserModelType } from '../../users/domain/user.schema';
import { BanBlogDto } from '../application/dto/BanBlogDto';
import { IdType } from '../../models/IdType';
import { CreateBlogDto } from '../application/dto/CreateBlogDto';
import { UpdateBlogDto } from '../application/dto/UpdateBlogDto';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';

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

  async findBlogDocument(blogId: IdType): Promise<BlogDocument | null> {
    return this.BlogModel.findById(blogId);
  }
  async findBlogId(blogId: IdType): Promise<IdType | RESPONSE_ERROR> {
    const blog = await this.findBlogDocument(blogId);
    if (!blog) return RESPONSE_ERROR.NOT_FOUND;
    return blog._id;
  }

  async deleteBlog(blogId: IdType): Promise<RESPONSE_ERROR | RESPONSE_SUCCESS> {
    const res = await this.BlogModel.deleteOne({ _id: blogId });
    if (res.deletedCount === 0) return RESPONSE_ERROR.NOT_FOUND;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async getOwnerId(blogId: IdType) {
    const blog = await this.findBlogDocument(blogId);
    if (!blog) return null;
    return blog.blogOwnerInfo.userId;
  }

  async bunUnbanBlog(blogId: IdType, banBlogDto: BanBlogDto) {
    const blog = await this.findBlogDocument(blogId);
    if (!blog) return null;
    blog.banUnbanBlog(banBlogDto);
    await this.saveBlog(blog);
  }

  // async bindBlog(blogId: IdType, userId: IdType, userLogin: string) {
  //   const blog = await this.findBlogDocument(blogId);
  //   if (!blog) return null;
  //   blog.bindUser(userId, userLogin);
  //   await this.saveBlog(blog);
  // }
  async createBlog(
    userId: IdType,
    blogDto: CreateBlogDto,
  ): Promise<IdType | RESPONSE_ERROR> {
    const user = await this.UserModel.findById(userId);
    if (!user) return RESPONSE_ERROR.SERVER_ERROR;
    const newBlog = this.BlogModel.createNewBlog(
      blogDto,
      userId,
      user.login,
      this.BlogModel,
    );
    await this.saveBlog(newBlog);
    return newBlog._id;
  }
  async updateBlog(
    blogId: IdType,
    blogDto: UpdateBlogDto,
  ): Promise<RESPONSE_ERROR | RESPONSE_SUCCESS> {
    const blog = await this.findBlogDocument(blogId);
    if (!blog) return RESPONSE_ERROR.NOT_FOUND;
    await this._changeBlogNamePosts(blog.name, blogDto.name);
    await blog.updateBlog(blogDto);
    await this.saveBlog(blog);
    return RESPONSE_SUCCESS.NO_CONTENT;
  }
  private async _changeBlogNamePosts(blogOldName: string, newBlogName) {
    const posts = await this.PostModel.find({ blogOldName });
    await this.PostModel.changeBlogName(posts, newBlogName);
  }
}
