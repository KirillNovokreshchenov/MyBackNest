import { LIKE_STATUS } from "./LikeStatusEnum";
import { IsEnum } from "class-validator";

export class LikeStatusDto {
  @IsEnum(LIKE_STATUS)
  likeStatus: LIKE_STATUS;
}
