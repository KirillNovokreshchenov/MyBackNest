import { Injectable } from '@nestjs/common';
import { UserViewModel } from '../api/view-model/UserViewModel';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.schema';
import { Model, Types } from 'mongoose';
import { userFilter } from '../users-helpers/user-filter';
import { skipPages } from '../../helpers/skip-pages';
import { sortQuery } from '../../helpers/sort-query';
import { UserViewModelAll } from '../api/view-model/UserViewModelAll';
import { pagesCount } from '../../helpers/pages-count';
import { UserQueryModel } from './models/UserQueryModel';
import { UserQueryInputType } from '../api/input-model/UserQueryInputType';
import { UserAuthViewModel } from '../../auth/api/view-model/UserAuthViewModel';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async findUserById(userId): Promise<UserViewModel | null> {
    const foundUser = await this.userModel.findById(userId).lean();
    if (!foundUser) return null;

    return new UserViewModel(foundUser);
  }
  async findUserAuth(userId: Types.ObjectId) {
    const foundUser = await this.userModel.findById(userId).lean();
    if (!foundUser) return null;
    return new UserAuthViewModel(foundUser);
  }

  async findAllUsers(dataQuery: UserQueryInputType) {
    const query = new UserQueryModel(dataQuery);

    const filter = userFilter(
      query.searchLoginTerm,
      query.searchEmailTerm,
      query.banStatus,
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

    const mapUsers = allUsers.map((user) => new UserViewModel(user));

    return new UserViewModelAll(
      countPages,
      query.pageNumber,
      query.pageSize,
      totalCount,
      mapUsers,
    );
  }
}
