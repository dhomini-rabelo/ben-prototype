export interface Pagination<T> {
  items: T[];
  page: number;
  totalItems: number;
}

export interface CursorPagination<T> {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface ItemAPIResponse<T> {
  item: T;
}
