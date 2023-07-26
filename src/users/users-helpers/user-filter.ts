export function userFilter(
  searchLoginTerm: string | null,
  searchEmailTerm: string | null,
) {
  if (searchLoginTerm && searchEmailTerm) {
    return {
      $or: [
        { login: { $regex: searchLoginTerm, $options: 'i' } },
        { email: { $regex: searchEmailTerm, $options: 'i' } },
      ],
    };
  }
  if (searchLoginTerm) {
    return { login: { $regex: searchLoginTerm, $options: 'i' } };
  }
  if (searchEmailTerm) {
    return { email: { $regex: searchEmailTerm, $options: 'i' } };
  }
  return {};
}
