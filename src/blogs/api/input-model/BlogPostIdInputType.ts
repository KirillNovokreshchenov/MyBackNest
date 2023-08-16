import { Types } from 'mongoose';

export type BlogPostIdInputType = {
  postId: Types.ObjectId;
  blogId: Types.ObjectId;
};
