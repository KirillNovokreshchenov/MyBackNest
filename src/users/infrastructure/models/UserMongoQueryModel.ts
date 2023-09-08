import { QueryModel } from "../../../models/QueryModel";
import { UserQueryInputType } from "../../api/input-model/UserQueryInputType";
import { BanStatus } from "../../users-helpers/ban-status-enum";

export class UserMongoQueryModel extends QueryModel {
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
  banStatus: BanStatus | BanStatus.ALL;
  constructor(public dataQuery: UserQueryInputType) {
    super(dataQuery);
    this.searchLoginTerm = dataQuery.searchLoginTerm || null;
    this.searchEmailTerm = dataQuery.searchEmailTerm || null;
    this.banStatus = dataQuery.banStatus || BanStatus.ALL;
  }
}
