import { Injectable } from '@nestjs/common';
import {
  UserMongoViewModel,
  UserSQLViewModel,
  UserViewModel,
} from '../api/view-model/UserViewModel';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.schema';
import { userFilter } from '../users-helpers/user-filter';
import { skipPages } from '../../helpers/skip-pages';
import { sortQuery } from '../../helpers/sort-query';
import { UserViewModelAll } from '../api/view-model/UserViewModelAll';
import { pagesCount } from '../../helpers/pages-count';
import { UserMongoQueryModel } from './models/UserMongoQueryModel';
import { UserQueryInputType } from '../api/input-model/UserQueryInputType';
import { UserAuthViewModel } from '../../auth/api/view-model/UserAuthViewModel';
import { Blog, BlogModelType } from '../../blogs/domain/blog.schema';
import { BannedUserForBlogViewModel } from '../api/view-model/BannedUserForBlogViewModel';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { IdType } from '../../models/IdType';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserSQLQueryModel } from './models/UserSQLQueryModel';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name) private userModel: UserModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}
  async findUserById(userId: IdType): Promise<UserViewModel | RESPONSE_ERROR> {
    const foundUser = await this.userModel.findById(userId).lean();
    if (!foundUser) return RESPONSE_ERROR.NOT_FOUND;

    return new UserMongoViewModel(foundUser);
  }
  async findUserAuth(userId: IdType) {
    const foundUser = await this.userModel.findById(userId).lean();
    if (!foundUser) return RESPONSE_ERROR.UNAUTHORIZED;
    return new UserAuthViewModel(foundUser);
  }

  async findAllUsers(dataQuery: UserQueryInputType) {
    const data = await this._dataFindUser(dataQuery);

    const mapUsers = data.users.map((user) => new UserMongoViewModel(user));

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
    if (!blog) return RESPONSE_ERROR.NOT_FOUND;
    if (blog.blogOwnerInfo.userId.toString() !== userId.toString())
      return RESPONSE_ERROR.FORBIDDEN;
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
    const query = new UserMongoQueryModel(dataQuery);

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

@Injectable()
export class UsersSQLQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findUserById(userId: IdType): Promise<UserViewModel | RESPONSE_ERROR> {
    const foundUser = await this.dataSource.query(
      `
    SELECT user_id, login, email, "createdAt"
FROM public.users
WHERE user_id = $1
    `,
      [userId],
    );
    if (!foundUser) return RESPONSE_ERROR.NOT_FOUND;

    return new UserSQLViewModel(foundUser[0]);
  }

  async findAllUsers(dataQuery: UserQueryInputType) {
    const data = await this._dataFindUser(dataQuery);

    const mapUsers = data.users.map((user) => new UserSQLViewModel(user));

    return new UserViewModelAll(
      data.countPages,
      data.pageNumber,
      data.pageSize,
      data.totalCount,
      mapUsers,
    );
  }
  async _dataFindUser(dataQuery: UserQueryInputType) {
    const query = new UserSQLQueryModel(dataQuery);

    let totalCount = await this.dataSource.query(
      `
           SELECT COUNT(*)
           FROM public.users
           WHERE (login ILIKE $1 OR email ILIKE $2) AND is_deleted <> true;
            `,
      [query.searchLoginTerm, query.searchEmailTerm],
    );
    totalCount = +totalCount[0].count;
    const countPages = pagesCount(totalCount, query.pageSize);
    const skip = skipPages(query.pageNumber, query.pageSize);

    const allUsers = await this.dataSource.query(
      `
    SELECT user_id, login, email, password, "createdAt"
FROM public.users
WHERE (login ILIKE $1 OR email ILIKE $2) AND is_deleted <> true
ORDER BY "${query.sortBy}" ${query.sortDirection}
LIMIT $3 OFFSET $4
    `,
      [query.searchLoginTerm, query.searchEmailTerm, query.pageSize, skip],
    );
    return {
      totalCount,
      countPages,
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      users: allUsers,
    };
  }
  async findUserAuth(userId: IdType) {
    try {
      const user = await this.dataSource.query(
        `
SELECT email, login, user_id as "userId"
FROM public.users
WHERE user_id = $1;
`,
        [userId],
      );
      if (!user[0]) return RESPONSE_ERROR.NOT_FOUND;
      return user[0];
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }
}
