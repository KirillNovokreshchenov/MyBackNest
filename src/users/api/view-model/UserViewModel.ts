import { BanInfo, User } from '../../domain/user.schema';
import { UserSQlModel } from '../../infrastructure/models/UserSQLModel';

export class UserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
  banInfo: BanInfo;
}

export class UserMongoViewModel extends UserViewModel {
  constructor(user: User) {
    super();
    this.id = user._id.toString();
    this.login = user.login;
    this.email = user.email;
    this.createdAt = user.createdAt;
    this.banInfo = {
      isBanned: user.banInfo.isBanned,
      banDate: user.banInfo.banDate,
      banReason: user.banInfo.banReason,
    };
  }
}

export class UserSQLViewModel extends UserViewModel {
  constructor(user: UserSQlModel) {
    super();
    this.id = user.user_id;
    this.login = user.login;
    this.email = user.email;
    this.createdAt = user.createdAt;
    // this.banInfo = {
    //   isBanned: user.banInfo?.isBanned || false,
    //   banDate: user.banInfo?.banDate || null,
    //   banReason: user.banInfo?.banReason || null,
    // };
  }
}
