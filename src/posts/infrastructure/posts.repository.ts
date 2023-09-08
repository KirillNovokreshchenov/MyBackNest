import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog, BlogModelType } from "../../blogs/domain/blog.schema";
import { Post, PostDocument, PostModelType } from "../domain/post.schema";
import { PostLike, PostLikeDocument, PostLikeModelType } from "../domain/post-like.schema";
import { IdType } from "../../models/IdType";
import { CreatePostDto } from "../application/dto/CreatePostDto";
import { UpdatePostDto } from "../application/dto/UpdatePostDto";
import { LIKE_STATUS } from "../../models/LikeStatusEnum";

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
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
    userLogin: string,
    likeStatus: LIKE_STATUS,
  ) {
    const post = await this.findPostDocument(postId);
    if (!post) return null;
    const likeStatusCreated = post.createLikeStatus(
      userId,
      postId,
      userLogin,
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
