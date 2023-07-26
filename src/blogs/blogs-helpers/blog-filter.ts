export function blogFilter(searchNameTerm: string | null) {
  if (searchNameTerm) {
    return { name: { $regex: searchNameTerm, $options: 'i' } };
  }
  return {};
}
