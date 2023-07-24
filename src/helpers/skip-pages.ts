export function skipPages(pageNumber: number, pageSize: number) {
  return (pageNumber - 1) * pageSize;
}
