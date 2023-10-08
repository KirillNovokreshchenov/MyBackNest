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
@Injectable()
export class BlogsSQLRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findBlogId(blogId: IdType): Promise<IdType | RESPONSE_ERROR> {
    try {
      const blog = await this.dataSource.query(
        `
    SELECT blog_id
    FROM public.sa_blogs
    WHERE blog_id = $1
    `,
        [blogId],
      );
      return blog[0].blog_id;
    } catch (e) {
      return RESPONSE_ERROR.NOT_FOUND;
    }
  }
  /* async findDataBlog(blogId: string) {
    try {
      const blog = await this.dataSource.query(
        `
    SELECT owner_id as "ownerId", name as "blogName"
FROM public.blogs
WHERE blog_id = $1 AND is_deleted <> true
    `,
        [blogId],
      );
      return blog[0];
    } catch (e) {
      return null;
    }
  }

  async findBlogName(blogId: string) {
    try {
      const blog = await this.dataSource.query(
        `
    SELECT name as "blogName"
FROM public.sa_blogs
WHERE blog_id = $1 AND is_deleted <> true
    `,
        [blogId],
      );
      return blog[0];
    } catch (e) {
      return null;
    }
  }
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
  }*/
  async createBlog(userId: IdType, blogDto: CreateBlogDto) {
    try {
      const newBlog = await this.dataSource.query(
        `
            INSERT INTO public.sa_blogs(
      name, description, website_url)
      VALUES ( $1, $2, $3)
      RETURNING blog_id;
            `,
        [blogDto.name, blogDto.description, blogDto.websiteUrl],
      );
      // const newBlog = await this.dataSource.query(
      //   `
      //       INSERT INTO public.blogs(
      // owner_id, name, description, website_url)
      // VALUES ( $1, $2, $3, $4)
      // RETURNING blog_id;
      //       `,
      //   [userId, blogDto.name, blogDto.description, blogDto.websiteUrl],
      // );
      //       console.log(blogDto);
      //       const newBlog = await this.dataSource.query(
      //         `
      // INSERT INTO public.blogs(owner_id, name, description, website_url)
      // SELECT $1, $2, $3,$4
      // WHERE NOT EXISTS(SELECT user_id FROM users WHERE user_id = $1 AND is_deleted = true)
      // RETURNING blog_id;
      //       `,
      //         [userId, blogDto.name, blogDto.description, blogDto.websiteUrl],
      //       );
      return newBlog[0].blog_id;
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }

  async updateBlog(blogId: IdType, blogDto: UpdateBlogDto) {
    try {
      const isUpdated = await this.dataSource.query(
        `
    UPDATE public.sa_blogs
SET name=$2, description=$3, website_url=$4
WHERE blog_id = $1;
    `,
        [blogId, blogDto.name, blogDto.description, blogDto.websiteUrl],
      );
      if (isUpdated[1] === 0) return RESPONSE_ERROR.NOT_FOUND;
      return RESPONSE_SUCCESS.NO_CONTENT;
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }
  async deleteBlog(blogId: IdType) {
    //     await this.dataSource.query(
    //       `
    //       WITH posts_update as (update posts
    // SET is_deleted = true
    // WHERE blog_id = $1),
    // comments_posts as(
    // SELECT post_id
    // FROM posts
    // LEFT JOIN comments c USING (post_id)
    // WHERE blog_id = $1
    // ),
    // comments_update as (
    // update comments
    // SET is_deleted = true
    // WHERE post_id IN(SELECT post_id FROM comments_posts)
    //   )
    // update blogs
    // SET is_deleted = true
    // Where blog_id = $1
    //       `,
    //       [blogId],
    //     );
    try {
      const isDeleted = await this.dataSource.query(
        `
      WITH posts_update as (update sa_posts
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
update sa_blogs 
SET is_deleted = true
Where blog_id = $1
      `,
        [blogId],
      );
      if (isDeleted[1] === 0) return RESPONSE_ERROR.NOT_FOUND;
      return RESPONSE_SUCCESS.NO_CONTENT;
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }
}
