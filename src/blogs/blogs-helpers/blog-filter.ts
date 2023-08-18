import { Types } from 'mongoose';

export function blogFilter(
  searchNameTerm: string | null,
  userId?: Types.ObjectId,
) {
  let filter = {};
  if (searchNameTerm) {
    filter = { name: { $regex: searchNameTerm, $options: 'i' } };
  }
  if (userId) {
    filter['blogOwnerInfo.userId'] = userId;
  }
  return filter;
}
