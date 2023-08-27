import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.schema';
import { PostLike, PostLikeModelType } from '../domain/post-like.schema';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected usersRepo: UsersRepository,
    protected blogsRepo: BlogsRepository,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
  ) {}

  // async createPost(
  //   postDto: CreatePostDto,
  //   userId: Types.ObjectId,
  // ): Promise<
  //   Types.ObjectId | RESPONSE_OPTIONS.FORBIDDEN | RESPONSE_OPTIONS.NOT_FOUND
  // > {
  //   const blog = await this.blogsRepo.findBlogById(
  //     new Types.ObjectId(postDto.blogId),
  //   );
  //   if (!blog) return RESPONSE_OPTIONS.NOT_FOUND;
  //   if (blog.blogOwnerInfo.userId.toString() !== userId.toString())
  //     return RESPONSE_OPTIONS.FORBIDDEN;
  //   const newPost: PostDocument = this.PostModel.createPost(
  //     postDto,
  //     blog.name,
  //     this.PostModel,
  //     userId,
  //   );
  //   await this.postsRepository.savePost(newPost);
  //   return newPost._id;
  // }

  // async updatePost(
  //   PostAnBlogId: BlogPostIdInputType,
  //   userId: Types.ObjectId,
  //   postDto: UpdatePostDto,
  // ): Promise<RESPONSE_OPTIONS> {
  //   const blog = await this.blogsRepo.findBlogById(PostAnBlogId.blogId);
  //   if (!blog) return RESPONSE_OPTIONS.NOT_FOUND;
  //   if (blog.blogOwnerInfo.userId.toString() !== userId.toString())
  //     return RESPONSE_OPTIONS.FORBIDDEN;
  //
  //   const post = await this.postsRepository.findPostDocument(
  //     PostAnBlogId.postId,
  //   );
  //   if (!post) return RESPONSE_OPTIONS.NOT_FOUND;
  //   if (post.userId.toString() !== userId.toString())
  //     return RESPONSE_OPTIONS.FORBIDDEN;
  //   post.updatePost(postDto);
  //   await this.postsRepository.savePost(post);
  //   return RESPONSE_OPTIONS.NO_CONTENT;
  // }

  // async deletePost(
  //   PostAndBlogId: BlogPostIdInputType,
  //   userId: Types.ObjectId,
  // ): Promise<RESPONSE_OPTIONS> {
  //   const blog = await this.blogsRepo.findBlogById(PostAndBlogId.blogId);
  //   if (!blog) return RESPONSE_OPTIONS.NOT_FOUND;
  //   if (blog.blogOwnerInfo.userId.toString() !== userId.toString())
  //     return RESPONSE_OPTIONS.FORBIDDEN;
  //   const post = await this.postsRepository.findPostDocument(
  //     PostAndBlogId.postId,
  //   );
  //   if (!post) return RESPONSE_OPTIONS.NOT_FOUND;
  //   if (post.userId.toString() !== userId.toString())
  //     return RESPONSE_OPTIONS.FORBIDDEN;
  //   await this.postsRepository.deletePost(PostAndBlogId.postId);
  //   return RESPONSE_OPTIONS.NO_CONTENT;
  // }

  // async updateLikeStatusPost(
  //   userId: Types.ObjectId,
  //   postId: Types.ObjectId,
  //   likeStatusDto: LikeStatusDto,
  // ) {
  //   const post = await this.postsRepository.findPostDocument(postId);
  //   if (!post) return false;
  //   const user = await this.usersRepo.findUserById(userId);
  //   if (!user) return false;
  //   const likeIsExist = await this.postsRepository.findLikeStatus(
  //     userId,
  //     postId,
  //   );
  //   if (!likeIsExist && likeStatusDto.likeStatus === LIKE_STATUS.NONE) {
  //     return false;
  //   }
  //   if (!likeIsExist) {
  //     const likeStatus = post.createLikeStatus(
  //       userId,
  //       postId,
  //       user.login,
  //       likeStatusDto.likeStatus,
  //       this.PostLikeModel,
  //     );
  //     await this.postsRepository.saveStatus(likeStatus);
  //     await this.postsRepository.savePost(post);
  //     return true;
  //   }
  //   if (likeStatusDto.likeStatus === LIKE_STATUS.NONE) {
  //     post.updateLikeNone(likeIsExist.likeStatus);
  //     await this.postsRepository.savePost(post);
  //     await this.postsRepository.deleteLikeStatus(likeIsExist._id);
  //   } else {
  //     post.updateLike(likeStatusDto.likeStatus, likeIsExist);
  //     await this.postsRepository.savePost(post);
  //     await this.postsRepository.saveStatus(likeIsExist);
  //   }
  //   return true;
  // }
}
