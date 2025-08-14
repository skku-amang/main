import { ProblemDocument, ValidationProblemDocument } from "./errors"

export type Success<T> = {
  isSuccess: true
  isFailure: false
  data: T
}
export type Failure = {
  isSuccess: false
  isFailure: true
  error: ProblemDocument | ValidationProblemDocument
}

export type ApiResult<T> = Success<T> | Failure
