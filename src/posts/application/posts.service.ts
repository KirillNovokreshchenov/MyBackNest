import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/post.schema';
import { CreatePostDto } from './dto/CreatePostDto';
import { Types } from 'mongoose';
import { UpdatePostDto } from './dto/UpdatePostDto';
import { LikeStatusDto } from '../../models/LikeStatusDto';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';
import { PostLike, PostLikeModelType } from '../domain/post-like.schema';
import { UsersRepository } from '../../users/infrastructure/users.repository';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected usersRepo: UsersRepository,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
  ) {}

  async createPost(postDto: CreatePostDto): Promise<Types.ObjectId | null> {
    const blogName = await this.postsRepository.findBlogName(
      new Types.ObjectId(postDto.blogId),
    );
    if (!blogName) return null;
    const newPost: PostDocument = this.PostModel.createPost(
      postDto,
      blogName,
      this.PostModel,
    );
    await this.postsRepository.savePost(newPost);
    return newPost._id;
  }

  async updatePost(
    postId: Types.ObjectId,
    postDto: UpdatePostDto,
  ): Promise<boolean> {
    const post: PostDocument | null =
      await this.postsRepository.findPostDocument(postId);
    if (!post) return false;
    const blogName = await this.postsRepository.findBlogName(
      new Types.ObjectId(postDto.blogId),
    );
    if (!blogName) return false;

    post.updatePost(postDto, blogName);
    await this.postsRepository.savePost(post);
    return true;
  }

  async deletePost(postId: Types.ObjectId): Promise<boolean> {
    return this.postsRepository.deletePost(postId);
  }

  async updateLikeStatus(
    userId: Types.ObjectId,
    postId: Types.ObjectId,
    likeStatusDto: LikeStatusDto,
  ) {
    const post = await this.postsRepository.findPostDocument(postId);
    if (!post) return false;
    const user = await this.usersRepo.findUserById(userId);
    if (!user) return false;
    const likeIsExist = await this.postsRepository.findLikeStatus(
      userId,
      postId,
    );
    if (!likeIsExist && likeStatusDto.likeStatus === LIKE_STATUS.NONE) {
      return false;
    }
    if (!likeIsExist) {
      const likeStatus = post.createLikeStatus(
        userId,
        postId,
        user.login,
        likeStatusDto.likeStatus,
        this.PostLikeModel,
      );
      await this.postsRepository.saveStatus(likeStatus);
      await this.postsRepository.savePost(post);
      return true;
    }
    if (likeStatusDto.likeStatus === LIKE_STATUS.NONE) {
      post.updateLikeNone(likeIsExist.likeStatus);
      await this.postsRepository.savePost(post);
      await this.postsRepository.deleteLikeStatus(likeIsExist._id);
    } else {
      post.updateLike(likeStatusDto.likeStatus, likeIsExist);
      await this.postsRepository.savePost(post);
      await this.postsRepository.saveStatus(likeIsExist);
    }
    return true;
  }
}
