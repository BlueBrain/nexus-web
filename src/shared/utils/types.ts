export type PaginatedList<T> = {
  total: number;
  index: number;
  results: T[];
  next?: string;
};
