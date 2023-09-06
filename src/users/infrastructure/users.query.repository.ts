import { Injectable } from '@nestjs/common';
import { UserViewModel } from '../api/view-model/UserViewModel';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.schema';
import { Types } from 'mongoose';
import { userFilter } from '../users-helpers/user-filter';
import { skipPages } from '../../helpers/skip-pages';
import { sortQuery } from '../../helpers/sort-query';
import { UserViewModelAll } from '../api/view-model/UserViewModelAll';
import { pagesCount } from '../../helpers/pages-count';
import { UserQueryModel } from './models/UserQueryModel';
import { UserQueryInputType } from '../api/input-model/UserQueryInputType';
import { UserAuthViewModel } from '../../auth/api/view-model/UserAuthViewModel';
import { Blog, BlogModelType } from '../../blogs/domain/blog.schema';
import { BannedUserForBlogViewModel } from '../api/view-model/BannedUserForBlogViewModel';
import { RESPONSE_OPTIONS } from '../../models/ResponseOptionsEnum';
import { IdType } from '../../models/IdType';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name) private userModel: UserModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}
  async findUserById(userId: IdType): Promise<UserViewModel | null> {
    const foundUser = await this.userModel.findById(userId).lean();
    if (!foundUser) return null;

    return new UserViewModel(foundUser);
  }
  async findUserAuth(userId: IdType) {
    const foundUser = await this.userModel.findById(userId).lean();
    if (!foundUser) return null;
    return new UserAuthViewModel(foundUser);
  }

  async findAllUsers(dataQuery: UserQueryInputType) {
    const data = await this._dataFindUser(dataQuery);

    const mapUsers = data.users.map((user) => new UserViewModel(user));

    return new UserViewModelAll(
      data.countPages,
      data.pageNumber,
      data.pageSize,
      data.totalCount,
      mapUsers,
    );
  }
  async findBannedUsersForBlogs(
    dataQuery: UserQueryInputType,
    blogId: IdType,
    userId: IdType,
  ) {
    const blog = await this.BlogModel.findById(blogId);
    if (!blog) return RESPONSE_OPTIONS.NOT_FOUND;
    if (blog.blogOwnerInfo.userId.toString() !== userId.toString())
      return RESPONSE_OPTIONS.FORBIDDEN;
    const data = await this._dataFindUser(dataQuery, blogId);
    const mapUsers = data.users.map((user) => {
      const banInfo = user.isBannedForBlogs.find(
        (ban) => ban.blogId.toString() === blogId.toString(),
      );
      return new BannedUserForBlogViewModel(
        user._id,
        user.login,
        banInfo!.banInfo,
      );
    });

    return new UserViewModelAll(
      data.countPages,
      data.pageNumber,
      data.pageSize,
      data.totalCount,
      mapUsers,
    );
  }

  async _dataFindUser(
    dataQuery: UserQueryInputType,
    blogIdForBannedUsers?: IdType,
  ) {
    const query = new UserQueryModel(dataQuery);

    const filter = userFilter(
      query.searchLoginTerm,
      query.searchEmailTerm,
      query.banStatus,
      blogIdForBannedUsers,
    );

    const totalCount = await this.userModel.countDocuments(filter);
    const countPages = pagesCount(totalCount, query.pageSize);
    const sort = sortQuery(query.sortDirection, query.sortBy);
    const skip = skipPages(query.pageNumber, query.pageSize);

    const allUsers = await this.userModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(query.pageSize)
      .lean();
    return {
      totalCount,
      countPages,
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      users: allUsers,
    };
  }
}
