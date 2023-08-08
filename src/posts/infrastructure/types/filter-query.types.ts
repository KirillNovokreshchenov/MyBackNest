import { Types } from 'mongoose';

export type PostFilterType = {
  userId?: Types.ObjectId;
  blogId?: Types.ObjectId;
};
