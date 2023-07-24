import { QueryInputModel } from '../users/api/input-model/QueryInputModel';
import { QueryConstants } from './QueryConstants';

export class QueryModel {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
  constructor(public dataQuery: QueryInputModel) {
    this.sortBy = dataQuery.sortBy || QueryConstants.SortBy;
    this.sortDirection =
      dataQuery.sortDirection || QueryConstants.SortDirectionDesc;
    this.pageNumber = +(dataQuery.pageNumber || QueryConstants.PageNumber);
    this.pageSize = +(dataQuery.pageSize || QueryConstants.PageSize);
    this.searchLoginTerm = dataQuery.searchLoginTerm || null;
    this.searchEmailTerm = dataQuery.searchEmailTerm || null;
  }
}
