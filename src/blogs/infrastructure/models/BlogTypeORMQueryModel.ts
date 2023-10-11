import { QueryModel } from '../../../models/QueryModel';
import { BlogQueryInputType } from '../../api/input-model/BlogQueryInputType';

export class BlogTypeORMQueryModel extends QueryModel {
  searchNameTerm: string;

  constructor(dataQuery: BlogQueryInputType) {
    super(dataQuery);
    this.searchNameTerm = dataQuery.searchNameTerm
      ? `%${dataQuery.searchNameTerm}%`
      : `%%`;
  }
}
