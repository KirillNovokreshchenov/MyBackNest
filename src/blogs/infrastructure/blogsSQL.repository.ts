import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IdType } from '../../models/IdType';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { CreateBlogDto } from '../application/dto/CreateBlogDto';
import { UpdateBlogDto } from '../application/dto/UpdateBlogDto';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';

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
