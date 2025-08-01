import { ApiError } from "./errors"

export type Success<T> = {
  isSuccess: true
  isFailure: false
  data: T
}
export type Failure<E = ApiError> = {
  isSuccess: false
  isFailure: true
  error: E
}

export type ApiResult<T, E = ApiError> = Success<T> | Failure<E>
