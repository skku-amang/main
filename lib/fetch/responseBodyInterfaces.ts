export interface ListResponse<T> extends Array<T> {}

export type CreateRetrieveUpdateResponse<T> = T

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
