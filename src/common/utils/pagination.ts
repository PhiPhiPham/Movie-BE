import { PaginationQueryDto } from '../dto/pagination.dto';
import { PaginationParams, PagedResponse } from '../types/pagination';

export function getPaginationParams(query: PaginationQueryDto): PaginationParams {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function buildPagedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PagedResponse<T> {
  return {
    data,
    page: params.page,
    page_size: params.pageSize,
    total,
  };
}
