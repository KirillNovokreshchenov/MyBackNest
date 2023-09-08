import { QueryInputType } from "../../../models/QueryInputType";

export type BlogQueryInputType = QueryInputType & {
  searchNameTerm?: string;
};
