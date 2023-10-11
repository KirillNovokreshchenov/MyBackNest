import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { IdType } from '../../models/IdType';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { CreatePostDto } from '../application/dto/CreatePostDto';
import { UpdatePostDto } from '../application/dto/UpdatePostDto';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';
import { LikeStatusBLType } from '../../models/LikeStatusBLType';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';
import { Post } from '../domain/entities-typeorm/post.entity';
import { PostLike } from '../domain/entities-typeorm/post-like.entity';

@Injectable()
export class PostsTypeORMRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Post) protected postsRepo: Repository<Post>,
    @InjectRepository(PostLike) protected postLikesRepo: Repository<PostLike>,
  ) {}

  async findPostId(postId: string): Promise<IdType | RESPONSE_ERROR> {
    const post = await this.postsRepo.findOneBy({ postId });
    if (!post) return RESPONSE_ERROR.NOT_FOUND;
    return post.postId;
  }

  async createPost(
    postDto: CreatePostDto,
    userId: IdType,
  ): Promise<IdType | RESPONSE_ERROR> {
    const post = new Post();
    post.blogId = postDto.blogId;
    post.title = postDto.title;
    post.shortDescription = postDto.shortDescription;
    post.content = postDto.content;
    await this.postsRepo.save(post);
    return post.postId;
  }

  async updatePost(
    postId: IdType,
    postDto: UpdatePostDto,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    await this.postsRepo.update(postId, {
      title: postDto.title,
      shortDescription: postDto.shortDescription,
      content: postDto.content,
    });
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async findLikeStatus(
    userId: string,
    postId: string,
  ): Promise<LikeStatusBLType | RESPONSE_ERROR> {
    const likeData = await this.postLikesRepo.findOne({
      where: {
        postId: postId,
        ownerId: userId,
      },
    });
    if (!likeData) return RESPONSE_ERROR.NOT_FOUND;
    return { likeId: likeData.likeId, likeStatus: likeData.likeStatus };
  }

  async createLikeStatus(
    userId: string,
    postId: string,
    likeStatus: LIKE_STATUS,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    const postLike = new PostLike();
    postLike.ownerId = userId;
    postLike.postId = postId;
    postLike.likeStatus = likeStatus;
    await this.postLikesRepo.save(postLike);
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async updateLikeNone(
    postId: IdType,
    likeData: LikeStatusBLType,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    const isDeleted = await this.postLikesRepo.delete({
      likeId: likeData.likeId.toString(),
    });
    if (isDeleted.affected !== 1) return RESPONSE_ERROR.SERVER_ERROR;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async updateLike(
    postId: IdType,
    newLikeStatus: LIKE_STATUS,
    likeData: LikeStatusBLType,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    const isUpdated = await this.postLikesRepo.update(likeData.likeId, {
      likeStatus: newLikeStatus,
    });
    if (isUpdated.affected !== 1) return RESPONSE_ERROR.SERVER_ERROR;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async deletePost(postId: string) {
    const isUpdated = await this.postsRepo.update(postId, { isDeleted: true });
    if (isUpdated.affected !== 1) return RESPONSE_ERROR.SERVER_ERROR;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }
}
