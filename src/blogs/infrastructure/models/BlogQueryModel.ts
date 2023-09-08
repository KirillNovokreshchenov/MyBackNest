import { QueryModel } from "../../../models/QueryModel";
import { BlogQueryInputType } from "../../api/input-model/BlogQueryInputType";

export class BlogQueryModel extends QueryModel {
  searchNameTerm: string | null;
  constructor(dataQuery: BlogQueryInputType) {
    super(dataQuery);
    this.searchNameTerm = dataQuery.searchNameTerm || null;
  }
}
