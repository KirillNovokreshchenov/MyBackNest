import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreatePostDto } from '../application/dto/CreatePostDto';
import { UpdatePostDto } from '../application/dto/UpdatePostDto';
import { LIKE_STATUS } from '../../models/LikeStatusEnum';
import { PostLikeDocument, PostLikeModelType } from './post-like.schema';
import { IdType } from '../../models/IdType';

@Schema()
export class LikesInfo {
  @Prop({ default: 0 })
  likesCount: number;
  @Prop({ default: 0 })
  dislikesCount: number;
}

export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);
@Schema()
export class Post {
  _id: IdType;
  @Prop({ type: Types.ObjectId })
  userId: IdType;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  shortDescription: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true, type: Types.ObjectId })
  blogId: IdType;
  @Prop({ required: true })
  blogName: string;
  @Prop({ required: true })
  createdAt: Date;
  @Prop({ default: {}, type: LikesInfoSchema })
  likesInfo: LikesInfo;
  @Prop({ default: false })
  isBanned: boolean;

  updatePost(postDto: UpdatePostDto) {
    this.title = postDto.title;
    this.content = postDto.content;
    this.shortDescription = postDto.shortDescription;
  }
  isBannedPost(isBanned: boolean) {
    this.isBanned = isBanned;
  }
  countBan(likeStatus: LIKE_STATUS, isBanned: boolean) {
    if (isBanned) {
      if (likeStatus === LIKE_STATUS.LIKE) {
        this.likesInfo.likesCount -= 1;
      } else {
        this.likesInfo.dislikesCount -= 1;
      }
    } else {
      if (likeStatus === LIKE_STATUS.LIKE) {
        this.likesInfo.likesCount += 1;
      } else {
        this.likesInfo.dislikesCount += 1;
      }
    }
  }
  createLikeStatus(
    userId: IdType,
    postId: IdType,
    login: string,
    likeStatus: LIKE_STATUS,
    PostLikeModel: PostLikeModelType,
  ): PostLikeDocument {
    if (likeStatus === LIKE_STATUS.LIKE) {
      this.likesInfo.likesCount += 1;
    } else {
      this.likesInfo.dislikesCount += 1;
    }
    return new PostLikeModel({
      userId,
      postId,
      login,
      likeStatus,
      addedAt: new Date(),
    });
  }
  updateLikeNone(oldLike: LIKE_STATUS) {
    if (oldLike === LIKE_STATUS.LIKE) {
      this.likesInfo.likesCount -= 1;
    } else {
      this.likesInfo.dislikesCount -= 1;
    }
  }
  updateLike(currentLike: LIKE_STATUS, oldLike: PostLikeDocument) {
    if (currentLike === oldLike.likeStatus) return;
    if (currentLike === LIKE_STATUS.LIKE) {
      this.likesInfo.likesCount += 1;
      this.likesInfo.dislikesCount -= 1;
      oldLike.likeStatus = LIKE_STATUS.LIKE;
    } else {
      this.likesInfo.likesCount -= 1;
      this.likesInfo.dislikesCount += 1;
      oldLike.likeStatus = LIKE_STATUS.DISLIKE;
    }
  }
  static changeBlogName(posts: PostDocument[], blogName: string) {
    posts.map(async (post) => {
      post.blogName = blogName;
      await post.save();
    });
  }
  static createPost(
    postDto: CreatePostDto,
    blogName: string,
    PostModel: PostModelType,
    userId: IdType,
  ) {
    const blogId = new Types.ObjectId(postDto.blogId);
    return new PostModel({
      ...postDto,
      blogId,
      blogName,
      createdAt: new Date(),
      userId: userId,
    });
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

export type PostModelStaticType = {
  createPost: (
    postDto: CreatePostDto,
    blogName: string,
    PostModel: PostModelType,
    userId: IdType,
  ) => PostDocument;
  changeBlogName: (posts: PostDocument[], blogName: string) => void;
};

PostSchema.statics = {
  createPost: Post.createPost,
  changeBlogName: Post.changeBlogName,
};
PostSchema.methods = {
  updatePost: Post.prototype.updatePost,
  createLikeStatus: Post.prototype.createLikeStatus,
  updateLikeNone: Post.prototype.updateLikeNone,
  updateLike: Post.prototype.updateLike,
  isBannedPost: Post.prototype.isBannedPost,
  countBan: Post.prototype.countBan,
};

export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & PostModelStaticType;
