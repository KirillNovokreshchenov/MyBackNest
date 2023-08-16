import { Types } from 'mongoose';

export type BlogUserIdInputType = {
  userId: Types.ObjectId;
  blogId: Types.ObjectId;
};
