import { QueryInputType } from '../../../models/QueryInputType';
import { BanStatus } from '../../users-helpers/ban-status-enum';

export type UserQueryInputType = QueryInputType & {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  banStatus?: BanStatus;
};
