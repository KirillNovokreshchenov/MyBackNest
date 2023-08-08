import { Post } from '../../domain/post.schema';
import { LIKE_STATUS } from '../../../models/LikeStatusEnum';
import { NewestLikes } from './NewestLikeModel';

type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LIKE_STATUS;
  newestLikes: NewestLikes[];
};

export class PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfo;
  constructor(post: Post, lastLikes: NewestLikes[], likeStatus?: LIKE_STATUS) {
    this.id = post._id.toString();
    this.title = post.title;
    this.shortDescription = post.shortDescription;
    this.content = post.content;
    this.blogId = post.blogId.toString();
    this.blogName = post.blogName;
    this.createdAt = post.createdAt;
    this.extendedLikesInfo = {
      likesCount: post.likesInfo.likesCount,
      dislikesCount: post.likesInfo.dislikesCount,
      myStatus: likeStatus || LIKE_STATUS.NONE,
      newestLikes: lastLikes,
    };
  }
}
