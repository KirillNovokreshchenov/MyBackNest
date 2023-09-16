import { Comment } from '../../domain/comment.schema';
import { LIKE_STATUS } from '../../../models/LikeStatusEnum';
import { CommentSQLModel } from '../../infractructure/models/CommentSQLModel';

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
}

export class CommentMongoViewModel extends CommentViewModel {
  constructor(comment: Comment, likeStatus?: LIKE_STATUS) {
    super();
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
export class CommentSQLViewModel extends CommentViewModel {
  constructor(comment: CommentSQLModel, myLikeStatus: LIKE_STATUS) {
    super();
    this.id = comment.comment_id;
    this.content = comment.content;
    this.commentatorInfo = {
      userId: comment.userId,
      userLogin: comment.userLogin,
    };
    this.createdAt = comment.createdAt;
    this.likesInfo = {
      likesCount: comment.like_count,
      dislikesCount: comment.dislike_count,
      myStatus: myLikeStatus,
    };
  }
}
