import { QueryModel } from '../../../models/QueryModel';
import { UserQueryInputType } from '../../api/input-model/UserQueryInputType';

export class UserTypeORMQueryModel extends QueryModel {
  searchLoginTerm: string;
  searchEmailTerm: string;

  constructor(public dataQuery: UserQueryInputType) {
    super(dataQuery);
    this.searchLoginTerm = dataQuery.searchLoginTerm
      ? `%${dataQuery.searchLoginTerm}%`
      : `%%`;
    this.searchEmailTerm = dataQuery.searchEmailTerm
      ? `%${dataQuery.searchEmailTerm}%`
      : `%%`;
  }
}
