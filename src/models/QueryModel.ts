import { QueryInputType } from './QueryInputType';
import { QueryConstants } from './QueryConstants';

export class QueryModel {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;

  constructor(public dataQuery: QueryInputType) {
    this.sortBy = dataQuery.sortBy || QueryConstants.SortBy;
    this.sortDirection =
      dataQuery.sortDirection === 'asc'
        ? QueryConstants.SortDirectionAsc
        : QueryConstants.SortDirectionDesc;
    this.pageNumber = +(dataQuery.pageNumber || QueryConstants.PageNumber);
    this.pageSize = +(dataQuery.pageSize || QueryConstants.PageSize);
  }
}
