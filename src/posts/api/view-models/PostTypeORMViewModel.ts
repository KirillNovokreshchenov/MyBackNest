import { PostViewModel } from './PostViewModel';
import { NewestLikes } from './NewestLikeModel';
import { LIKE_STATUS } from '../../../models/LikeStatusEnum';
import { PostTypeORMViewType } from '../view-types/PostTypeORMViewType';

export class PostTypeORMViewModel extends PostViewModel {
  constructor(
    post: PostTypeORMViewType,
    lastLikes: NewestLikes[],
    likeStatus?: LIKE_STATUS,
  ) {
    super();
    this.id = post.postId;
    this.title = post.title;
    this.shortDescription = post.shortDescription;
    this.content = post.content;
    this.blogId = post.blogId;
    this.blogName = post.blog.name;
    this.createdAt = post.createdAt;
    this.extendedLikesInfo = {
      myStatus: likeStatus || LIKE_STATUS.NONE,
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,
      newestLikes: lastLikes,
    };
  }
}
