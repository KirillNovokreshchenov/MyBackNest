import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { IdType } from '../../models/IdType';
import {
  UserSQLViewModel,
  UserViewModel,
} from '../api/view-model/UserViewModel';
import { UserQueryInputType } from '../api/input-model/UserQueryInputType';
import { UserViewModelAll } from '../api/view-model/UserViewModelAll';
import { pagesCount } from '../../helpers/pages-count';
import { skipPages } from '../../helpers/skip-pages';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { User } from '../domain/entities-typeorm/user.entity';
import { UserTypeOrmViewModel } from '../api/view-model/UserViewTypeOrmModel';
import { UserTypeORMQueryModel } from './models/UserTypeORMQueryModel';

@Injectable()
export class UsersQueryTypeormRepoQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(User) protected usersRepo: Repository<User>,
  ) {}
  async findUserById(userId: string): Promise<UserViewModel | RESPONSE_ERROR> {
    const user = await this.usersRepo.findOneBy({ userId, isDeleted: false });
    if (!user) return RESPONSE_ERROR.NOT_FOUND;
    return new UserTypeOrmViewModel(user);
  }

  async findAllUsers(dataQuery: UserQueryInputType) {
    const data = await this._dataFindUser(dataQuery);

    const mapUsers = data.users.map((user) => new UserTypeOrmViewModel(user));

    return new UserViewModelAll(
      data.countPages,
      data.pageNumber,
      data.pageSize,
      data.totalCount,
      mapUsers,
    );
  }
  async _dataFindUser(dataQuery: UserQueryInputType) {
    const query = new UserTypeORMQueryModel(dataQuery);

    const condition = {
      login: ILike(query.searchLoginTerm),
      email: ILike(query.searchEmailTerm),
    };

    const skip = skipPages(query.pageNumber, query.pageSize);
    const [allUsers, totalCount] = await this.usersRepo.findAndCount({
      order: {
        [query.sortBy]: query.sortDirection,
      },
      where: [
        { login: condition.login, isDeleted: false },
        { email: condition.email, isDeleted: false },
      ],
      skip: skip,
      take: query.pageSize,
    });
    const countPages = pagesCount(totalCount, query.pageSize);
    return {
      totalCount,
      countPages,
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      users: allUsers,
    };
  }
  async findUserAuth(userId: string) {
    const user = await this.usersRepo.findOneBy({ userId });
    if (!user) return RESPONSE_ERROR.NOT_FOUND;
    return { userId: user.userId, email: user.email, login: user.login };
  }
}
