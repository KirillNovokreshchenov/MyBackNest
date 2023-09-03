import { BanInfo, User } from '../../domain/user.schema';

export class UserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
  banInfo: BanInfo;
  constructor(user: User) {
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
