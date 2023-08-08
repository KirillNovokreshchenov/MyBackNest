import { Comment } from '../../domain/comment.schema';
import { LIKE_STATUS } from '../../../models/LikeStatusEnum';

type CommentatorInfo = {
  userId: string;
  userLogin: string;
};
type CommentLikeInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LIKE_STATUS;
};
export class CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
  likesInfo: CommentLikeInfo;
  constructor(comment: Comment, likeStatus?: LIKE_STATUS) {
    this.id = comment._id.toString();
    this.content = comment.content;
    this.commentatorInfo = {
      userId: comment.userId.toString(),
      userLogin: comment.userLogin,
    };
    this.createdAt = comment.createdAt;
    this.likesInfo = {
      likesCount: comment.likesInfo.likesCount,
      dislikesCount: comment.likesInfo.dislikesCount,
      myStatus: likeStatus || LIKE_STATUS.NONE,
    };
  }
}
