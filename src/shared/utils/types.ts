export type PaginationSettings = {
  total: number;
  from: number;
  pageSize: number;
};

export interface PaginatedList<T> {
  total: number;
  index: number;
  results: T[];
  next?: string;
}
