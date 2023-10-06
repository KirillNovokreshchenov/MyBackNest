import { IdType } from './IdType';
import { LIKE_STATUS } from './LikeStatusEnum';

export type LikeStatusBLType = {
  likeId: IdType;
  likeStatus: LIKE_STATUS;
};
