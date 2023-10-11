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
import { User, UserModelType } from '../../users/domain/user.schema';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';
import { LikeStatusBLType } from '../../models/LikeStatusBLType';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
  ) {}

  async savePost(newPost: PostDocument) {
    await newPost.save();
  }

  private async findPostDocument(postId: IdType): Promise<PostDocument | null> {
    return this.PostModel.findById(postId);
  }
  async findPostId(postId: IdType): Promise<IdType | RESPONSE_ERROR> {
    const post = await this.findPostDocument(postId);
    if (!post) return RESPONSE_ERROR.NOT_FOUND;
    return post._id;
  }

  async deletePost(postId: IdType) {
    const isDeleted = await this.PostModel.deleteOne({ _id: postId });
    if (isDeleted.deletedCount === 0) return RESPONSE_ERROR.SERVER_ERROR;
    return RESPONSE_SUCCESS.NO_CONTENT;
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

  async createPost(
    postDto: CreatePostDto,
    userId: IdType,
  ): Promise<IdType | RESPONSE_ERROR> {
    const blog = await this.BlogModel.findById(postDto.blogId).lean();
    if (!blog) return RESPONSE_ERROR.SERVER_ERROR;
    const newPost: PostDocument = this.PostModel.createPost(
      postDto,
      blog.name,
      this.PostModel,
      userId,
    );
    await this.savePost(newPost);
    return newPost._id;
  }

  async updatePost(
    postId: IdType,
    postDto: UpdatePostDto,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    const post = await this.findPostDocument(postId);
    if (!post) return RESPONSE_ERROR.SERVER_ERROR;
    post.updatePost(postDto);
    await this.savePost(post);
    return RESPONSE_SUCCESS.NO_CONTENT;
  }
  async findLikeStatus(
    userId: IdType,
    postId: IdType,
  ): Promise<LikeStatusBLType | RESPONSE_ERROR> {
    const likeStatus = await this.PostLikeModel.findOne({
      userId,
      postId,
    });
    if (!likeStatus) return RESPONSE_ERROR.NOT_FOUND;
    return { likeId: likeStatus._id, likeStatus: likeStatus.likeStatus };
  }
  async createLikeStatus(
    userId: IdType,
    postId: IdType,
    likeStatus: LIKE_STATUS,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    const post = await this.findPostDocument(postId);
    if (!post) return RESPONSE_ERROR.SERVER_ERROR;
    const user = await this.UserModel.findById(userId);
    if (!user) return RESPONSE_ERROR.SERVER_ERROR;
    const likeStatusCreated = post.createLikeStatus(
      userId,
      postId,
      user.login,
      likeStatus,
      this.PostLikeModel,
    );
    await this.saveStatus(likeStatusCreated);
    await this.savePost(post);
    return RESPONSE_SUCCESS.NO_CONTENT;
  }
  async updateLikeNone(
    postId: IdType,
    likeData: LikeStatusBLType,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    const post = await this.findPostDocument(postId);
    if (!post) return RESPONSE_ERROR.SERVER_ERROR;
    post.updateLikeNone(likeData.likeStatus);
    await this.savePost(post);
    await this.deleteLikeStatus(likeData.likeId);
    return RESPONSE_SUCCESS.NO_CONTENT;
  }
  async updateLike(
    postId: IdType,
    newLikeStatus: LIKE_STATUS,
    likeData: LikeStatusBLType,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    const post = await this.findPostDocument(postId);
    if (!post) return RESPONSE_ERROR.SERVER_ERROR;
    const oldLike = await this.PostLikeModel.findById(likeData.likeId);
    if (!oldLike) return RESPONSE_ERROR.SERVER_ERROR;
    post.updateLike(newLikeStatus, oldLike);
    await this.savePost(post);
    await this.saveStatus(oldLike);
    return RESPONSE_SUCCESS.NO_CONTENT;
  }
}
