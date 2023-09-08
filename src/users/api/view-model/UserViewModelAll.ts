import { UserViewModel } from "./UserViewModel";
import { ViewModelAll } from "../../../models/ViewModelAll";
import { BannedUserForBlogViewModel } from "./BannedUserForBlogViewModel";

export class UserViewModelAll extends ViewModelAll {
  constructor(
    public pagesCount,
    public page,
    public pageSize,
    public totalCount,
    public items: UserViewModel[] | BannedUserForBlogViewModel[],
  ) {
    super(pagesCount, page, pageSize, totalCount);
  }
}
