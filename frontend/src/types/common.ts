export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/** Matches backend PaginatedResponse[T] */
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface SelectOption {
  value: string
  label: string
}

export interface NavItem {
  label: string
  href: string
  icon?: string
  adminOnly?: boolean
}

export type ViewMode = 'grid' | 'list' | 'map'

export type SortOption =
  | 'date_desc'
  | 'date_asc'
  | 'price_asc'
  | 'price_desc'
