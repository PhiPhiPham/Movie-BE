export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export interface PagedResponse<T> {
  data: T[];
  page: number;
  page_size: number;
  total: number;
}
