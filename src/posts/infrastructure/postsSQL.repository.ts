import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IdType } from '../../models/IdType';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { CreatePostDto } from '../application/dto/CreatePostDto';
import { UpdatePostDto } from '../application/dto/UpdatePostDto';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';
import { LikeStatusBLType } from '../../models/LikeStatusBLType';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';

@Injectable()
export class PostsSQLRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findPostId(postId: IdType): Promise<IdType | RESPONSE_ERROR> {
    // try {
    //   const post = await this.dataSource.query(
    //     `
    // SELECT post_id
    // FROM public.posts
    // WHERE post_id = $1
    // `,
    //     [postId],
    //   );
    //   return post[0].post_id;
    // } catch (e) {
    //   return null;
    // }
    try {
      const post = await this.dataSource.query(
        `
    SELECT post_id
    FROM public.sa_posts
    WHERE post_id = $1
    `,
        [postId],
      );
      return post[0].post_id;
    } catch (e) {
      return RESPONSE_ERROR.NOT_FOUND;
    }
  }

  /*  async findPostOwnerId(postId: IdType) {
    try {
      const post = await this.dataSource.query(
        `
    SELECT owner_id
    FROM public.posts
    WHERE post_id = $1
    `,
        [postId],
      );
      return post[0].owner_id;
    } catch (e) {
      return null;
    }
  }*/

  async createPost(
    postDto: CreatePostDto,
    userId: IdType,
  ): Promise<IdType | RESPONSE_ERROR> {
    //     const newPost = await this.dataSource.query(
    //       `
    //     INSERT INTO public.posts(
    // owner_id, blog_id, title, short_description, content)
    // SELECT $1, $2, $3, $4, $5
    // WHERE NOT EXISTS(SELECT user_id FROM users WHERE user_id = $1 AND is_deleted = true)
    // RETURNING post_id
    //     `,
    //       [
    //         userId,
    //         postDto.blogId,
    //         postDto.title,
    //         postDto.shortDescription,
    //         postDto.content,
    //       ],
    //     );
    try {
      const newPost = await this.dataSource.query(
        `
    INSERT INTO public.sa_posts(
blog_id, title, short_description, content)
SELECT $1, $2, $3, $4
RETURNING post_id
    `,
        [
          postDto.blogId,
          postDto.title,
          postDto.shortDescription,
          postDto.content,
        ],
      );
      return newPost[0].post_id;
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }

  async updatePost(
    postId: IdType,
    postDto: UpdatePostDto,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    //     const post = await this.dataSource.query(
    //       `
    //     UPDATE public.posts
    // SET title=$2, short_description=$3, content=$4
    // WHERE post_id = $1;
    //     `,
    //       [postId, postDto.title, postDto.shortDescription, postDto.content],
    //     );
    const post = await this.dataSource.query(
      `
    UPDATE public.sa_posts
SET title=$2, short_description=$3, content=$4
WHERE post_id = $1;
    `,
      [postId, postDto.title, postDto.shortDescription, postDto.content],
    );
    if (post[1] === 0) return RESPONSE_ERROR.SERVER_ERROR;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async findLikeStatus(
    userId: IdType,
    postId: IdType,
  ): Promise<LikeStatusBLType | RESPONSE_ERROR> {
    try {
      const likeData = await this.dataSource.query(
        `
      SELECT like_id as "likeId",like_status as "likeStatus"
      FROM public.posts_likes
      WHERE post_id = $1 AND owner_id = $2;
      `,
        [postId, userId],
      );
      if (!likeData[0]) return RESPONSE_ERROR.NOT_FOUND;
      return likeData[0];
    } catch (e) {
      return RESPONSE_ERROR.NOT_FOUND;
    }
  }

  async createLikeStatus(
    userId: IdType,
    postId: IdType,
    likeStatus: LIKE_STATUS,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    try {
      await this.dataSource.query(
        `
     INSERT INTO public.posts_likes(
owner_id, post_id, like_status)
VALUES ($1, $2, $3);
     `,
        [userId, postId, likeStatus],
      );
      return RESPONSE_SUCCESS.NO_CONTENT;
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }

  async updateLikeNone(
    postId: IdType,
    likeData: LikeStatusBLType,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    try {
      await this.dataSource.query(
        `
    DELETE FROM public.posts_likes
    WHERE like_id = $1;
    `,
        [likeData.likeId],
      );
      return RESPONSE_SUCCESS.NO_CONTENT;
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }

  async updateLike(
    postId: IdType,
    newLikeStatus: LIKE_STATUS,
    likeData: LikeStatusBLType,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    try {
      await this.dataSource.query(
        `
    UPDATE public.posts_likes
SET like_status= $1
WHERE like_id = $2;
    `,
        [newLikeStatus, likeData.likeId],
      );
      return RESPONSE_SUCCESS.NO_CONTENT;
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }

  async deletePost(postId: IdType) {
    //     await this.dataSource.query(
    //       `
    //       WITH
    // comments_update as (
    // update comments
    // SET is_deleted = true
    // WHERE post_id = $1
    //   )
    // update posts
    // SET is_deleted = true
    // Where post_id = $1
    //       `,
    //       [postId],
    //     );
    try {
      await this.dataSource.query(
        `
      WITH 
comments_update as (
update comments
SET is_deleted = true
WHERE post_id = $1 
  )
update sa_posts 
SET is_deleted = true
Where post_id = $1
      `,
        [postId],
      );
      return RESPONSE_SUCCESS.NO_CONTENT;
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }
}
