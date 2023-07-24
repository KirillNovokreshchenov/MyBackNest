export function pagesCount(totalCount: number, pageSize: number) {
  return Math.ceil(totalCount / pageSize);
}
