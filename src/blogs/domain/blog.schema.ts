import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateBlogDto } from '../application/dto/CreateBlogDto';
import { UpdateBlogDto } from '../application/dto/UpdateBlogDto';

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

  updateBlog(dto: UpdateBlogDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
  static createNewBlog(
    blogDto: CreateBlogDto,
    BlogModel: BlogModelType,
  ): BlogDocument {
    return new BlogModel({ ...blogDto, createdAt: new Date() });
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

export type BlogModelStaticType = {
  createNewBlog: (
    blogDto: CreateBlogDto,
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
