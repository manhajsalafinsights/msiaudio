/** Parameter & hasil pagination standar (architecture.md §3.7). */
export type PageParams = {
  page: number;
  perPage: number;
};

export type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};
