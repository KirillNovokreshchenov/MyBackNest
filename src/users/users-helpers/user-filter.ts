import { BanStatus } from './ban-status-enum';

export function userFilter(
  searchLoginTerm: string | null,
  searchEmailTerm: string | null,
  banStatus: BanStatus,
) {
  let filter = {};
  if (searchLoginTerm && searchEmailTerm) {
    filter = {
      $or: [
        { login: { $regex: searchLoginTerm, $options: 'i' } },
        { email: { $regex: searchEmailTerm, $options: 'i' } },
      ],
    };
  }
  if (searchLoginTerm) {
    filter = { login: { $regex: searchLoginTerm, $options: 'i' } };
  }
  if (searchEmailTerm) {
    filter = { email: { $regex: searchEmailTerm, $options: 'i' } };
  }
  if (banStatus === BanStatus.BANNED) {
    filter['banInfo.isBanned'] = { $ne: false };
  } else if (banStatus === BanStatus.NOT_BANNED) {
    filter['banInfo.isBanned'] = { $ne: true };
  }
  return filter;
}
