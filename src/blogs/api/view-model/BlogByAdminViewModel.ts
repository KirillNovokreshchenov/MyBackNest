import { BanBlogInfo, Blog, BlogOwnerInfo } from '../../domain/blog.schema';
import { BlogViewModel } from './BlogViewModel';

export class BlogByAdminViewModel extends BlogViewModel {
  blogOwnerInfo: BlogOwnerInfo;
  banInfo: BanBlogInfo;
  constructor(blog: Blog) {
    super(blog);
    this.blogOwnerInfo = {
      userId: blog.blogOwnerInfo.userId,
      userLogin: blog.blogOwnerInfo.userLogin,
    };
    this.banInfo = {
      isBanned: blog.banInfo.isBanned,
      banDate: blog.banInfo.banDate,
    };
  }
}
