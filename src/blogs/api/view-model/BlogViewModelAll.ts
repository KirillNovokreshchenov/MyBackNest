import { ViewModelAll } from '../../../models/ViewModelAll';
import { BlogViewModel } from './BlogViewModel';

export class BlogViewModelAll extends ViewModelAll {
  constructor(
    public pagesCount,
    public page,
    public pageSize,
    public totalCount,
    public items: BlogViewModel[],
  ) {
    super(pagesCount, page, pageSize, totalCount);
  }
}
