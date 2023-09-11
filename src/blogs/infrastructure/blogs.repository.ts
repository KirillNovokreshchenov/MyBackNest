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
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

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
  async createBlog(userId: IdType, blogDto: CreateBlogDto) {
    const userData: { userId: IdType; userLogin: string } | null =
      await this.findUserForBlog(userId);
    if (!userData) return null;
    const newBlog = this.BlogModel.createNewBlog(
      blogDto,
      userId,
      userData.userLogin,
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
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findOwnerId(blogId: IdType) {
    try {
      const blog = await this.dataSource.query(
        `
    SELECT owner_id
    FROM public.blogs
    WHERE blog_id =$1;
    `,
        [blogId],
      );
      return blog[0].owner_id;
    } catch (e) {
      return null;
    }
  }
  async createBlog(userId: IdType, blogDto: CreateBlogDto) {
    try {
      //       const newBlog = await this.dataSource.query(
      //         `
      //       INSERT INTO public.blogs(
      // owner_id, name, description, website_url)
      // VALUES ( $1, $2, $3, $4)
      // RETURNING blog_id;
      //       `,
      //         [userId, blogDto.name, blogDto.description, blogDto.websiteUrl],
      //       );
      const newBlog = await this.dataSource.query(
        `
INSERT INTO public.blogs(owner_id, name, description, website_url)
SELECT $1, $2, $3,$4
WHERE NOT EXISTS(SELECT user_id FROM users WHERE user_id = $1 AND is_deleted = true)
RETURNING blog_id;
      `,
        [userId, blogDto.name, blogDto.description, blogDto.websiteUrl],
      );
      console.log(newBlog);
      return newBlog[0].blog_id;
    } catch (e) {
      return null;
    }
  }

  async updateBlog(blogId: IdType, blogDto: UpdateBlogDto) {
    const isUpdated = await this.dataSource.query(
      `
    UPDATE public.blogs
SET name=$2, description=$3, website_url=$4
WHERE blog_id = $1;
    `,
      [blogId, blogDto.name, blogDto.description, blogDto.websiteUrl],
    );
    if (isUpdated[1] === 0) return null;
  }
  async deleteBlog(blogId: IdType) {
    await this.dataSource.query(
      `
      WITH posts_update as (update posts
SET is_deleted = true
WHERE blog_id = $1),
comments_posts as(
SELECT post_id
FROM posts
LEFT JOIN comments c USING (post_id)
WHERE blog_id = $1
),
comments_update as (
update comments
SET is_deleted = true
WHERE post_id IN(SELECT post_id FROM comments_posts) 
  )
update blogs 
SET is_deleted = true
Where blog_id = $1
      `,
      [blogId],
    );
  }
}
