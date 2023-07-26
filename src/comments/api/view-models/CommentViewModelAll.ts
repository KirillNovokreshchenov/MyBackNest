import { ViewModelAll } from '../../../models/ViewModelAll';
import { CommentViewModel } from './CommentViewModel';

export class CommentViewModelAll extends ViewModelAll {
  constructor(
    public pagesCount,
    public page,
    public pageSize,
    public totalCount,
    public items: CommentViewModel[],
  ) {
    super(pagesCount, page, pageSize, totalCount);
  }
}
