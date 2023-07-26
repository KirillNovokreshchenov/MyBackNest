import { ViewModelAll } from '../../../models/ViewModelAll';
import { PostViewModel } from './PostViewModel';

export class PostViewModelAll extends ViewModelAll {
  constructor(
    public pagesCount,
    public page,
    public pageSize,
    public totalCount,
    public items: PostViewModel[],
  ) {
    super(pagesCount, page, pageSize, totalCount);
  }
}
