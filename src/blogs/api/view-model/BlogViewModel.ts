import { BlogDocument } from '../../domain/blog.schema';
import { BlogSQLModel } from '../../infrastructure/models/BlogSQLModel';
import { Blog } from '../../domain/entities-typeorm/blog.entity';

export class BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
}
export class BlogMongoViewModel extends BlogViewModel {
  constructor(blog: BlogDocument) {
    super();
    this.id = blog._id.toString();
    this.name = blog.name;
    this.description = blog.description;
    this.websiteUrl = blog.websiteUrl;
    this.createdAt = blog.createdAt;
    this.isMembership = blog.isMembership;
  }
}
export class BlogSQLViewModel extends BlogViewModel {
  constructor(blog: BlogSQLModel) {
    super();
    this.id = blog.blog_id;
    this.name = blog.name;
    this.description = blog.description;
    this.websiteUrl = blog.websiteUrl;
    this.createdAt = blog.createdAt;
    this.isMembership = blog.isMembership;
  }
}
export class BlogTypeORMViewModel extends BlogViewModel {
  constructor(blog: Blog) {
    super();
    this.id = blog.blogId;
    this.name = blog.name;
    this.description = blog.description;
    this.websiteUrl = blog.websiteUrl;
    this.createdAt = blog.createdAt;
    this.isMembership = blog.isMembership;
  }
}
