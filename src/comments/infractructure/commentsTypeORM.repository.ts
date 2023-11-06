import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { IdType } from '../../models/IdType';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { LikeStatusBLType } from '../../models/LikeStatusBLType';
import { CreateCommentDto } from '../application/dto/CreateCommentDto';
import { UpdateCommentDto } from '../application/dto/UpdateCommentDto';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';
import { Post } from '../../posts/domain/entities-typeorm/post.entity';
import { PostLike } from '../../posts/domain/entities-typeorm/post-like.entity';
import { Comment } from '../domain/entities-typeorm/comment.entity';
import { CommentLike } from '../domain/entities-typeorm/comment-like.entity';

export class CommentsTypeOrmRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Comment) protected commentsRepo: Repository<Comment>,
    @InjectRepository(CommentLike)
    protected commentLikesRepo: Repository<CommentLike>,
  ) {}

  async findCommentId(commentId: string) {
    const comment = await this.commentsRepo.findOne({
      where: { commentId: commentId, isDeleted: false },
    });
    if (!comment) return RESPONSE_ERROR.NOT_FOUND;
    return comment.commentId;
  }

  async findCommentOwnerId(commentId: string) {
    const comment = await this.commentsRepo.findOne({
      where: { commentId: commentId, isDeleted: false },
    });
    if (!comment) return RESPONSE_ERROR.NOT_FOUND;
    return comment.ownerId;
  }

  async findLikeStatus(
    userId: string,
    commentId: string,
  ): Promise<LikeStatusBLType | RESPONSE_ERROR> {
    const likeData = await this.commentLikesRepo.findOne({
      where: {
        commentId: commentId,
        ownerId: userId,
      },
    });
    if (!likeData) return RESPONSE_ERROR.NOT_FOUND;
    return { likeId: likeData.likeId, likeStatus: likeData.likeStatus };
  }

  async createComment(
    userId: string,
    postId: string,
    commentDto: CreateCommentDto,
  ): Promise<string | RESPONSE_ERROR> {
    const comment = new Comment();
    comment.ownerId = userId;
    comment.content = commentDto.content;
    comment.postId = postId;
    await this.commentsRepo.save(comment);
    return comment.commentId;
  }

  async updateComment(
    commentId: string,
    commentDto: UpdateCommentDto,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    await this.commentsRepo.update(commentId, {
      content: commentDto.content,
    });
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async deleteComment(commentId: IdType) {
    const isUpdated = await this.commentsRepo.update(commentId, {
      isDeleted: true,
    });
    if (isUpdated.affected !== 1) return RESPONSE_ERROR.SERVER_ERROR;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async createLikeStatus(
    userId: string,
    commentId: string,
    likeStatus: LIKE_STATUS,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    const commentLike = new CommentLike();
    commentLike.ownerId = userId;
    commentLike.commentId = commentId;
    commentLike.likeStatus = likeStatus;
    await this.commentLikesRepo.save(commentLike);
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async updateLikeNone(
    commentId: string,
    likeData: LikeStatusBLType,
  ): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    const isDeleted = await this.commentLikesRepo.delete({
      likeId: likeData.likeId.toString(),
    });
    if (isDeleted.affected !== 1) return RESPONSE_ERROR.SERVER_ERROR;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async updateLike(
    commentId: IdType,
    newLikeStatus: LIKE_STATUS,
    oldLikeData: LikeStatusBLType,
  ) {
    const isUpdated = await this.commentLikesRepo.update(oldLikeData.likeId, {
      likeStatus: newLikeStatus,
    });
    if (isUpdated.affected !== 1) return RESPONSE_ERROR.SERVER_ERROR;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }
}
