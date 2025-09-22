/* eslint-disable @typescript-eslint/no-explicit-any */
import { PromiseWithError } from "@repo/api-client"

/**
 * ApiClient 메서드에서 에러 타입을 추출합니다.
 */
export type ApiErrorType<
  T extends (...args: any) => PromiseWithError<any, any>
> = ReturnType<T> extends PromiseWithError<any, infer E> ? E : never

/**
 * ApiClient 메서드에서 성공 데이터 타입을 추출합니다.
 * Awaited<T>는 Promise가 resolve하는 값의 타입을 반환합니다.
 */
export type ApiSuccessType<
  T extends (...args: any) => PromiseWithError<any, any>
> = Awaited<ReturnType<T>>
