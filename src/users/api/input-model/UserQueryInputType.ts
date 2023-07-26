import { QueryInputType } from '../../../models/QueryInputType';

export type UserQueryInputType = QueryInputType & {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
};
