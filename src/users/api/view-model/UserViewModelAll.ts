import { UserViewModel } from './UserViewModel';
import { ViewModelAll } from '../../../models/ViewModelAll';
import { BannedUser } from '../../../blogs/domain/blog.schema';

export class UserViewModelAll extends ViewModelAll {
  constructor(
    public pagesCount,
    public page,
    public pageSize,
    public totalCount,
    public items: UserViewModel[] | BannedUser[],
  ) {
    super(pagesCount, page, pageSize, totalCount);
  }
}
