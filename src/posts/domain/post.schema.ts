import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreatePostDto } from '../application/dto/CreatePostDto';
import { UpdatePostDto } from '../application/dto/UpdatePostDto';

@Schema()
export class UsersLikes {
  @Prop({ required: true })
  userId: Types.ObjectId;
  @Prop({ required: true })
  userLogin: number;
  @Prop({ default: new Date() })
  addedAt: Date;
  @Prop({ required: true })
  likeStatus: number;
}

export const UsersLikesSchema = SchemaFactory.createForClass(UsersLikes);
@Schema()
export class LikesInfo {
  @Prop({ default: 0 })
  likesCount: number;
  @Prop({ default: 0 })
  dislikesCount: number;
  @Prop({ default: [], type: [UsersLikesSchema] })
  usersLikes: UsersLikes[];
}

export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);
@Schema()
export class Post {
  _id: Types.ObjectId;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  shortDescription: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  blogId: Types.ObjectId;
  @Prop({ required: true })
  blogName: string;
  @Prop({ required: true })
  createdAt: Date;
  @Prop({ default: {}, type: LikesInfoSchema })
  likesInfo: LikesInfo;

  updatePost(postDto: UpdatePostDto, blogName: string) {
    this.title = postDto.title;
    this.content = postDto.content;
    this.shortDescription = postDto.shortDescription;
    this.blogId = new Types.ObjectId(postDto.blogId);
    this.blogName = blogName;
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
  ) {
    const blogId = new Types.ObjectId(postDto.blogId);
    return new PostModel({
      ...postDto,
      blogId,
      blogName,
      createdAt: new Date(),
    });
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

export type PostModelStaticType = {
  createPost: (
    postDto: CreatePostDto,
    blogName: string,
    PostModel: PostModelType,
  ) => PostDocument;
  changeBlogName: (posts: PostDocument[], blogName: string) => void;
};

PostSchema.statics = {
  createPost: Post.createPost,
  changeBlogName: Post.changeBlogName,
};
PostSchema.methods = {
  updatePost: Post.prototype.updatePost,
};

export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & PostModelStaticType;
