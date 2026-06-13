export interface Pagination<T> {
  items: T[]
  page: number
  totalItems: number
}

export interface CursorPaginationResponse<T> {
  items: T[]
  hasMore: boolean
  nextCursor: string | null
}

export interface ItemResponse<T> {
  item: T
}

export interface ListingResponse<T> {
  items: T[]
}
