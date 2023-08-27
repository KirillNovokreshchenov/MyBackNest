import { BanInfo } from '../../domain/user.schema';
import { Types } from 'mongoose';

export class BannedUserForBlogViewModel {
  id: string;
  login: string;
  banInfo: BanInfo;
  constructor(userId: Types.ObjectId, userLogin: string, banInfo: BanInfo) {
    this.id = userId.toString();
    this.login = userLogin;
    this.banInfo = banInfo;
  }
}
