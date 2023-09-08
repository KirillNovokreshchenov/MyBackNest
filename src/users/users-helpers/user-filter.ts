import { BanStatus } from "./ban-status-enum";
import { IdType } from "../../models/IdType";

export function userFilter(
  searchLoginTerm: string | null,
  searchEmailTerm: string | null,
  banStatus: BanStatus,
  blogIdForBannedUsers?: IdType,
) {
  let filter = {};
  if (searchLoginTerm && searchEmailTerm) {
    filter = {
      $or: [
        { login: { $regex: searchLoginTerm, $options: 'i' } },
        { email: { $regex: searchEmailTerm, $options: 'i' } },
      ],
    };
  } else if (searchLoginTerm) {
    filter = { login: { $regex: searchLoginTerm, $options: 'i' } };
  } else if (searchEmailTerm) {
    filter = { email: { $regex: searchEmailTerm, $options: 'i' } };
  }
  if (banStatus === BanStatus.BANNED) {
    filter['banInfo.isBanned'] = { $ne: false };
  } else if (banStatus === BanStatus.NOT_BANNED) {
    filter['banInfo.isBanned'] = { $ne: true };
  }
  if (blogIdForBannedUsers) {
    filter['isBannedForBlogs'] = {
      $elemMatch: { blogId: blogIdForBannedUsers },
    };
  }
  return filter;
}
