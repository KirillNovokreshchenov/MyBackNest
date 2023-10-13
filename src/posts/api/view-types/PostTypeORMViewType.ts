export type PostTypeORMViewType = {
  postId: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blog: { name: string };
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
};
