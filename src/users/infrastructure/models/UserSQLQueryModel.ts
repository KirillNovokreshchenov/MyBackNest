import { QueryModel } from "../../../models/QueryModel";
import { UserQueryInputType } from "../../api/input-model/UserQueryInputType";

export class UserSQLQueryModel extends QueryModel {
  searchLoginTerm: string;
  searchEmailTerm: string;

  // banStatus: BanStatus | BanStatus.ALL;
  constructor(public dataQuery: UserQueryInputType) {
    super(dataQuery);
    this.searchLoginTerm = dataQuery.searchLoginTerm
      ? `%${dataQuery.searchLoginTerm}%`
      : `%%`;
    this.searchEmailTerm = dataQuery.searchEmailTerm
      ? `%${dataQuery.searchEmailTerm}%`
      : `%%`;
    // this.banStatus = dataQuery.banStatus || BanStatus.ALL;
  }
}
