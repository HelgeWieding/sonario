export interface ApiResponse<T> {
  data: T
  error?: never
}

export interface ApiError {
  data?: never
  error: {
    message: string
    code?: string
  }
}

export type ApiResult<T> = ApiResponse<T> | ApiError

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface DashboardStats {
  totalProducts: number
  totalFeatureRequests: number
  newRequestsThisWeek: number
  totalFeedback: number
  gmailConnected: boolean
}
