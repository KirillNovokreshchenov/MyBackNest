import { Types } from 'mongoose';

export type PostParamInputType = {
  postId: Types.ObjectId;
  blogId: Types.ObjectId;
};
