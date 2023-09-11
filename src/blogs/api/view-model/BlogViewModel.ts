import { Blog, BlogDocument } from '../../domain/blog.schema';
import { BlogSQLModel } from '../../infrastructure/models/BlogSQLModel';

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
    this.websiteUrl = blog.website_url;
    this.createdAt = blog.created_at;
    this.isMembership = blog.is_membership;
  }
}
