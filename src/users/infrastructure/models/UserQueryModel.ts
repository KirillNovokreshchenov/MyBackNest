import { QueryModel } from '../../../models/QueryModel';
import { UserQueryInputType } from '../../api/input-model/UserQueryInputType';

export class UserQueryModel extends QueryModel {
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
  constructor(public dataQuery: UserQueryInputType) {
    super(dataQuery);
    this.searchLoginTerm = dataQuery.searchLoginTerm || null;
    this.searchEmailTerm = dataQuery.searchEmailTerm || null;
  }
}
