import { Injectable } from '@nestjs/common';
import { UserViewModel } from '../api/view-model/user-view-model';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.schema';
import { Model } from 'mongoose';
import { QueryModel } from '../../models/QueryModel';
import { QueryInputModel } from '../api/input-model/QueryInputModel';
import { userFilter } from '../helpersUser/user-filter';
import { skipPages } from '../../helpers/skip-pages';
import { sortQuery } from '../../helpers/sort-query';
import { UserViewModelAll } from '../api/view-model/user-view-model-all';
import { pagesCount } from '../../helpers/pages-count';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async findUserById(userId): Promise<UserViewModel | null> {
    const findUser: UserDocument | null = await this.userModel.findOne(userId);
    if (!findUser) return null;

    return new UserViewModel(findUser);
  }

  async findAllUsers(dataQuery: QueryInputModel) {
    const query = new QueryModel(dataQuery);

    const filter = userFilter(query.searchLoginTerm, query.searchEmailTerm);

    const totalCount = await this.userModel.countDocuments(filter);
    const countPages = pagesCount(totalCount, query.pageSize);
    const sort = sortQuery(query.sortDirection, query.sortBy);

    const allUsers = await this.userModel
      .find(filter)
      .sort(sort)
      .skip(skipPages(query.pageNumber, query.pageSize))
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
