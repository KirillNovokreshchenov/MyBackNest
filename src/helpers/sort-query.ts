import { QueryConstants } from '../models/QueryConstants';

export function sortQuery(sortDirection: string, sortBy: string) {
  if (sortDirection === QueryConstants.SortDirectionAsc) return `${sortBy}`;
  if (sortDirection === QueryConstants.SortDirectionDesc) return `-${sortBy}`;
}
