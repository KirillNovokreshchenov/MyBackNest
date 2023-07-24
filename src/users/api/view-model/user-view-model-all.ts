import { UserViewModel } from './user-view-model';
import { ViewModelAll } from '../../../models/ViewModelAll';

export class UserViewModelAll extends ViewModelAll {
  constructor(
    public pagesCount,
    public page,
    public pageSize,
    public totalCount,
    public items: UserViewModel[],
  ) {
    super(pagesCount, page, pageSize, totalCount);
  }
}
