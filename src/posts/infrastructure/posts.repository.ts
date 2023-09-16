import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../blogs/domain/blog.schema';
import { Post, PostDocument, PostModelType } from '../domain/post.schema';
import {
  PostLike,
  PostLikeDocument,
  PostLikeModelType,
} from '../domain/post-like.schema';
import { IdType } from '../../models/IdType';
import { CreatePostDto } from '../application/dto/CreatePostDto';
import { UpdatePostDto } from '../application/dto/UpdatePostDto';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User, UserModelType } from '../../users/domain/user.schema';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
  ) {}
  async findBlogName(blogId: IdType): Promise<string | null> {
    const blog = await this.BlogModel.findById(blogId).lean();
    if (!blog) return null;
    return blog.name;
  }

  async savePost(newPost: PostDocument) {
    await newPost.save();
  }

  async findPostDocument(postId: IdType): Promise<PostDocument | null> {
    return this.PostModel.findById(postId);
  }
  async findPostId(postId: IdType) {
    const post = await this.findPostDocument(postId);
    if (!post) return null;
    return post._id;
  }

  async deletePost(postId: IdType) {
    await this.PostModel.deleteOne({ _id: postId });
  }

  async saveStatus(likeStatus: PostLikeDocument) {
    await likeStatus.save();
  }
  async deleteLikeStatus(_id: IdType) {
    await this.PostLikeModel.deleteOne({ _id });
  }

  async banUnbanPost(userId: IdType, isBanned: boolean) {
    const posts = await this.PostModel.find({ userId });
    await Promise.all(
      posts.map(async (post) => {
        post.isBannedPost(isBanned);
        await this.savePost(post);
      }),
    );
  }

  async _banUnbanLikesPostUser(userId: IdType, isBanned: boolean) {
    const likesPost = await this.PostLikeModel.find({ userId });
    await Promise.all(
      likesPost.map(async (like) => {
        like.isBannedLike();
        const post = await this.findPostDocument(like.postId);
        if (post) {
          post.countBan(like.likeStatus, isBanned);
          await this.savePost(post);
        }
        await this.saveStatus(like);
      }),
    );
  }

  async PostsBlogBan(blogId: IdType, isBanned: boolean) {
    const posts = await this.PostModel.find({ blogId });
    await Promise.all(
      posts.map(async (post) => {
        post.isBannedPost(isBanned);
        await this.savePost(post);
      }),
    );
  }

  async findOwnerBlogId(postId: IdType) {
    const post = await this.findPostDocument(postId);
    if (!post) return null;
    return { ownerBlogId: post.userId, blogId: post.blogId };
  }
  async createPost(postDto: CreatePostDto, blogName: string, userId: IdType) {
    const newPost: PostDocument = this.PostModel.createPost(
      postDto,
      blogName,
      this.PostModel,
      userId,
    );
    await this.savePost(newPost);
    return newPost._id;
  }

  async findPostOwnerId(postId: IdType) {
    const post = await this.findPostDocument(postId);
    if (!post) return null;
    return post.userId;
  }
  async updatePost(postId: IdType, postDto: UpdatePostDto) {
    const post = await this.findPostDocument(postId);
    if (!post) return null;
    post.updatePost(postDto);
    await this.savePost(post);
  }
  async findLikeStatus(userId: IdType, postId: IdType) {
    const likeStatus = await this.PostLikeModel.findOne({
      userId,
      postId,
    });
    if (!likeStatus) return null;
    return { likeId: likeStatus._id, likeStatus: likeStatus.likeStatus };
  }
  async createLikeStatus(
    userId: IdType,
    postId: IdType,
    likeStatus: LIKE_STATUS,
  ) {
    const post = await this.findPostDocument(postId);
    if (!post) return null;
    const user = await this.UserModel.findById(userId);
    if (!user) return null;
    const likeStatusCreated = post.createLikeStatus(
      userId,
      postId,
      user.login,
      likeStatus,
      this.PostLikeModel,
    );
    await this.saveStatus(likeStatusCreated);
    await this.savePost(post);
  }
  async updateLikeNone(
    postId: IdType,
    likeData: { likeId: IdType; likeStatus: LIKE_STATUS },
  ) {
    const post = await this.findPostDocument(postId);
    if (!post) return null;
    post.updateLikeNone(likeData.likeStatus);
    await this.savePost(post);
    await this.deleteLikeStatus(likeData.likeId);
  }
  async updateLike(
    postId: IdType,
    likeStatus: LIKE_STATUS,
    likeData: { likeId: IdType; likeStatus: LIKE_STATUS },
  ) {
    const post = await this.findPostDocument(postId);
    if (!post) return null;
    const oldLike = await this.PostLikeModel.findById(likeData.likeId);
    if (!oldLike) return null;
    post.updateLike(likeStatus, oldLike);
    await this.savePost(post);
    await this.saveStatus(oldLike);
  }
}

@Injectable()
export class PostsSQLRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findPostId(postId: IdType) {
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
      return null;
    }
  }
  async findPostOwnerId(postId: IdType) {
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
  }

  async createPost(postDto: CreatePostDto, blogName: string, userId: IdType) {
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
  }

  async updatePost(postId: IdType, postDto: UpdatePostDto) {
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
    if (post[1] === 0) return null;
  }

  async findLikeStatus(userId: IdType, postId: IdType) {
    try {
      const likeData = await this.dataSource.query(
        `
      SELECT like_id as "likeId",like_status as "likeStatus"
      FROM public.posts_likes
      WHERE post_id = $1 AND owner_id = $2;
      `,
        [postId, userId],
      );
      return likeData[0];
    } catch (e) {
      return null;
    }
  }
  async createLikeStatus(
    userId: IdType,
    postId: IdType,
    likeStatus: LIKE_STATUS,
  ) {
    try {
      await this.dataSource.query(
        `
     INSERT INTO public.posts_likes(
owner_id, post_id, like_status)
VALUES ($1, $2, $3);
     `,
        [userId, postId, likeStatus],
      );
    } catch (e) {
      console.log(2);
      return null;
    }
  }
  async updateLikeNone(
    postId: IdType,
    likeData: { likeId: IdType; likeStatus: LIKE_STATUS },
  ) {
    const isDeleted = await this.dataSource.query(
      `
    DELETE FROM public.posts_likes
    WHERE like_id = $1;
    `,
      [likeData.likeId],
    );
    if (isDeleted[1] !== 1) return null;
  }
  async updateLike(
    postId: IdType,
    likeStatus: LIKE_STATUS,
    likeData: { likeId: IdType; likeStatus: LIKE_STATUS },
  ) {
    const isUpdated = this.dataSource.query(
      `
    UPDATE public.posts_likes
SET like_status= $1
WHERE like_id = $2;
    `,
      [likeStatus, likeData.likeId],
    );
    if (isUpdated[1] !== 1) return null;
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
  }
}
