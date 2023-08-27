import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comment.schema';
import { CommentsRepository } from '../infractructure/comments.repository';
import {
  CommentLike,
  CommentLikeModelType,
} from '../domain/comment-like.schema';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';

@Injectable()
export class CommentService {
  constructor(
    protected usersRepo: UsersRepository,
    protected postRepo: PostsRepository,
    protected commentRepo: CommentsRepository,
    protected blogsRepo: BlogsRepository,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
  ) {}
  // async createComment(
  //   userId: Types.ObjectId,
  //   postId: Types.ObjectId,
  //   commentDto: CreateCommentDto,
  // ) {
  //   const user = await this.usersRepo.findUserById(userId);
  //   if (!user) return RESPONSE_OPTIONS.NOT_FOUND;
  //   const post = await this.postRepo.findPostDocument(postId);
  //   if (!post) return RESPONSE_OPTIONS.NOT_FOUND;
  //   if (user.userIsBannedForBlog(post.blogId)) {
  //     return RESPONSE_OPTIONS.FORBIDDEN;
  //   }
  //   const postInfo: PostInfo = {
  //     id: post._id,
  //     title: post.title,
  //     blogId: post.blogId,
  //     blogName: post.blogName,
  //   };
  //
  //   const comment = await this.CommentModel.createComment(
  //     userId,
  //     post.userId,
  //     user.login,
  //     commentDto,
  //     postInfo,
  //     this.CommentModel,
  //   );
  //   await this.commentRepo.saveComment(comment);
  //   return comment._id;
  // }

  // async updateComment(
  //   userId: Types.ObjectId,
  //   commentId: Types.ObjectId,
  //   commentDto: UpdateCommentDto,
  // ): Promise<RESPONSE_OPTIONS> {
  //   const user = await this.usersRepo.findUserById(userId);
  //   if (!user) return RESPONSE_OPTIONS.NOT_FOUND;
  //   const comment = await this.commentRepo.findComment(commentId);
  //   if (!comment) return RESPONSE_OPTIONS.NOT_FOUND;
  //   if (userId.toString() !== comment.userId.toString())
  //     return RESPONSE_OPTIONS.FORBIDDEN;
  //   comment.updateComment(commentDto);
  //   await this.commentRepo.saveComment(comment);
  //   return RESPONSE_OPTIONS.NO_CONTENT;
  // }

  // async deleteComment(userId: Types.ObjectId, commentId: Types.ObjectId) {
  //   const comment = await this.commentRepo.findComment(commentId);
  //   if (!comment) return RESPONSE_OPTIONS.NOT_FOUND;
  //   if (userId.toString() !== comment.userId.toString())
  //     return RESPONSE_OPTIONS.FORBIDDEN;
  //   await this.commentRepo.deleteComment(commentId);
  //   return RESPONSE_OPTIONS.NO_CONTENT;
  // }

  // async updateLikeStatusComment(
  //   userId: Types.ObjectId,
  //   commentId: Types.ObjectId,
  //   likeStatusDto: LikeStatusDto,
  // ): Promise<boolean> {
  //   const comment = await this.commentRepo.findComment(commentId);
  //   if (!comment) return false;
  //   const likeIsExist = await this.commentRepo.findLikeStatus(
  //     userId,
  //     commentId,
  //   );
  //   if (!likeIsExist && likeStatusDto.likeStatus === LIKE_STATUS.NONE) {
  //     return false;
  //   }
  //   if (!likeIsExist) {
  //     const likeStatus = comment.createLikeStatus(
  //       userId,
  //       commentId,
  //       likeStatusDto.likeStatus,
  //       this.CommentLikeModel,
  //     );
  //     await this.commentRepo.saveStatus(likeStatus);
  //     await this.commentRepo.saveComment(comment);
  //     return true;
  //   }
  //   if (likeStatusDto.likeStatus === LIKE_STATUS.NONE) {
  //     comment.updateLikeNone(likeIsExist.likeStatus);
  //     await this.commentRepo.saveComment(comment);
  //     await this.commentRepo.deleteLikeStatus(likeIsExist._id);
  //   } else {
  //     comment.updateLike(likeStatusDto.likeStatus, likeIsExist);
  //     await this.commentRepo.saveComment(comment);
  //     await this.commentRepo.saveStatus(likeIsExist);
  //   }
  //   return true;
  // }
}
