import { CommentViewModel } from './CommentViewModel';
import { Comment, PostInfo } from '../../domain/comment.schema';
import { LIKE_STATUS } from '../../../models/LikeStatusEnum';

export class CommentForBlogViewModel extends CommentViewModel {
  postInfo: PostInfo;
  constructor(comment: Comment, likeStatus?: LIKE_STATUS) {
    super(comment, likeStatus);
    this.postInfo = {
      id: comment.postInfo.id,
      title: comment.postInfo.title,
      blogId: comment.postInfo.blogId,
      blogName: comment.postInfo.blogName,
    };
  }
}
