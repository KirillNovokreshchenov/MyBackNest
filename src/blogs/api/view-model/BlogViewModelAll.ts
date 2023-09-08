import { ViewModelAll } from "../../../models/ViewModelAll";
import { BlogViewModel } from "./BlogViewModel";
import { BlogByAdminViewModel } from "./BlogByAdminViewModel";

export class BlogViewModelAll extends ViewModelAll {
  constructor(
    public pagesCount,
    public page,
    public pageSize,
    public totalCount,
    public items: BlogViewModel[] | BlogByAdminViewModel[],
  ) {
    super(pagesCount, page, pageSize, totalCount);
  }
}
