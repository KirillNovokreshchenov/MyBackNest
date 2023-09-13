import {
  BanBlogInfo,
  BlogDocument,
  BlogOwnerInfo,
} from '../../domain/blog.schema';
import { BlogMongoViewModel } from './BlogViewModel';

export class BlogByAdminViewModel extends BlogMongoViewModel {
  blogOwnerInfo: BlogOwnerInfo;
  banInfo: BanBlogInfo;
  constructor(blog: BlogDocument) {
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
