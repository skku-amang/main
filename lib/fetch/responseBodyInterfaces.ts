export interface CreateListResponse<T> {
  data: T
}

export interface RetrieveUpdateResponse<T> {
  data: T
}

export interface DeleteResponse {
  detail: string
}

export interface ErrorResponse {
  detail: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
