import { QueryModel } from '../../../models/QueryModel';
import { BlogQueryInputType } from '../../api/input-model/BlogQueryInputType';

export class BlogSQLQueryModel extends QueryModel {
  searchNameTerm: string;
  constructor(dataQuery: BlogQueryInputType) {
    super(dataQuery);
    this.searchNameTerm = dataQuery.searchNameTerm
      ? `%${dataQuery.searchNameTerm}%`
      : `%%`;
  }
}
