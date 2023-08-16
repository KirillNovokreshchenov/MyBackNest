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
import { PostParamInputType } from '../../blogs/api/input-model/PostParamInputType';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { RESPONSE_OPTIONS } from '../../models/ResponseOptionsEnum';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected usersRepo: UsersRepository,
    protected blogsRepo: BlogsRepository,
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
    PostAnBlogId: PostParamInputType,
    userId: Types.ObjectId,
    postDto: UpdatePostDto,
  ): Promise<RESPONSE_OPTIONS> {
    const blog = await this.blogsRepo.findBlogById(PostAnBlogId.blogId);
    if (!blog) return RESPONSE_OPTIONS.NOT_FOUND;
    if (blog.blogOwnerInfo.userId !== userId) return RESPONSE_OPTIONS.FORBIDDEN;

    const post = await this.postsRepository.findPostDocument(
      PostAnBlogId.postId,
    );
    if (!post) return RESPONSE_OPTIONS.NOT_FOUND;
    post.updatePost(postDto);
    await this.postsRepository.savePost(post);
    return RESPONSE_OPTIONS.NO_CONTENT;
  }

  async deletePost(
    PostAnBlogId: PostParamInputType,
    userId: Types.ObjectId,
  ): Promise<boolean> {
    return this.postsRepository.deletePost(PostAnBlogId.postId);
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
