import { Types } from 'mongoose';
import { IdType } from '../../../models/IdType';

export type PostFilterType = {
  userId?: IdType;
  blogId?: IdType;
};
