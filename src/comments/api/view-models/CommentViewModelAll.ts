import { ViewModelAll } from '../../../models/ViewModelAll';
import { CommentViewModel } from './CommentViewModel';
import { CommentForBlogViewModel } from './CommentForBlogViewModel';

export class CommentViewModelAll extends ViewModelAll {
  constructor(
    public pagesCount,
    public page,
    public pageSize,
    public totalCount,
    public items: CommentViewModel[] | CommentForBlogViewModel[],
  ) {
    super(pagesCount, page, pageSize, totalCount);
  }
}
