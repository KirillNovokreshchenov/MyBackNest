import { IdType } from "../../models/IdType";

export function blogFilter(searchNameTerm: string | null, userId?: IdType) {
  let filter = {};
  if (searchNameTerm) {
    filter = { name: { $regex: searchNameTerm, $options: 'i' } };
  }
  if (userId) {
    filter['blogOwnerInfo.userId'] = userId;
  }
  return filter;
}
