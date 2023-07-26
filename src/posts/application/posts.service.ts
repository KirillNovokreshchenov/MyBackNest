import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/post.schema';
import { CreatePostDto } from './dto/CreatePostDto';
import { Types } from 'mongoose';
import { UpdatePostDto } from './dto/UpdatePostDto';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    @InjectModel(Post.name) private PostModel: PostModelType,
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
}
