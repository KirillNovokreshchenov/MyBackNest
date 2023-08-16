import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateBlogDto } from '../application/dto/CreateBlogDto';
import { UpdateBlogDto } from '../application/dto/UpdateBlogDto';
@Schema()
export class BlogOwnerInfo {
  @Prop({ required: true })
  userId: Types.ObjectId;
  @Prop({ required: true })
  userLogin: string;
}
const BlogOwnerInfoSchema = SchemaFactory.createForClass(BlogOwnerInfo);
@Schema()
export class Blog {
  _id: Types.ObjectId;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  websiteUrl: string;
  @Prop({ required: true })
  createdAt: Date;
  @Prop({ default: false })
  isMembership: boolean;
  @Prop({ required: true, type: BlogOwnerInfoSchema })
  blogOwnerInfo: BlogOwnerInfo;
  updateBlog(dto: UpdateBlogDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
  static createNewBlog(
    blogDto: CreateBlogDto,
    userId: Types.ObjectId,
    userLogin: string,
    BlogModel: BlogModelType,
  ): BlogDocument {
    return new BlogModel({
      ...blogDto,
      createdAt: new Date(),
      blogOwnerInfo: {
        userId: userId,
        userLogin: userLogin,
      },
    });
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

export type BlogModelStaticType = {
  createNewBlog: (
    blogDto: CreateBlogDto,
    userId: Types.ObjectId,
    userLogin: string,
    BlogModel: BlogModelType,
  ) => BlogDocument;
};

BlogSchema.statics = {
  createNewBlog: Blog.createNewBlog,
};
BlogSchema.methods = {
  updateBlog: Blog.prototype.updateBlog,
};
export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & BlogModelStaticType;
