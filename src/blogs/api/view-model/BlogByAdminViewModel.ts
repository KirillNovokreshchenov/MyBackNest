import { Blog, BlogOwnerInfo } from '../../domain/blog.schema';
import { BlogViewModel } from './BlogViewModel';

export class BlogByAdminViewModel extends BlogViewModel {
  blogOwnerInfo: BlogOwnerInfo;
  constructor(blog: Blog) {
    super(blog);
    this.blogOwnerInfo = blog.blogOwnerInfo;
  }
}