import { BanInfo } from "../../domain/user.schema";
import { IdType } from "../../../models/IdType";

export class BannedUserForBlogViewModel {
  id: string;
  login: string;
  banInfo: BanInfo;
  constructor(userId: IdType, userLogin: string, banInfo: BanInfo) {
    this.id = userId.toString();
    this.login = userLogin;
    this.banInfo = banInfo;
  }
}
