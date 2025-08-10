import { ProblemDocument } from "./errors"

export type Success<T> = {
  isSuccess: true
  isFailure: false
  data: T
}
export type Failure = {
  isSuccess: false
  isFailure: true
  error: ProblemDocument
}

export type ApiResult<T> = Success<T> | Failure
