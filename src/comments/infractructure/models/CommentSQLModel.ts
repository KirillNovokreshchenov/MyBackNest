export class CommentSQLModel {
  comment_id: string;
  userId: string;
  userLogin: string;
  content: string;
  createdAt: Date;
  like_count: number;
  dislike_count: number;
}
