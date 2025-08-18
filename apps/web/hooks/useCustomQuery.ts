import { useApiClient } from "@/lib/providers/api-client-provider"
import { ApiErrorType, ApiSuccessType } from "@/types/react-query"
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions
} from "@tanstack/react-query"

/**
 * 커스텀 쿼리 훅을 생성합니다.
 * 일반 useQuery와는 다르게 반환되는 데이터 타입, 에러 타입을 자동으로 추론합니다.
 * @template TApiFn ApiClient 메서드 타입(예: apiClient.getPerformanceById)
 * @template TArgs 생성될 커스텀 훅이 받을 인자들의 배열 타입 (예: [performanceId: number])
 * @param apiFn API 클라이언트 메서드
 * @param getQueryKey 쿼리 키 생성 함수
 * @returns 커스텀 쿼리 훅
 */
export function createQueryHook<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TApiFn extends (...args: any[]) => any,
  TArgs extends unknown[]
>(apiFn: TApiFn, getQueryKey: (...args: TArgs) => QueryKey) {
  // TData와 TError를 자동으로 추론합니다.
  type TData = ApiSuccessType<TApiFn>
  type TError = ApiErrorType<TApiFn>

  // 실제 사용될 커스텀 훅 함수를 반환합니다.
  return (
    options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">,
    ...args: TArgs
  ) => {
    const apiClient = useApiClient()

    return useQuery<TData, TError>({
      queryKey: getQueryKey(...args),
      // apiFn을 apiClient 인스턴스에 바인딩하여 호출합니다.
      queryFn: () => apiFn.bind(apiClient)(...args) as ReturnType<TApiFn>,
      ...options
    })
  }
}

/**
 * 커스텀 뮤테이션 훅을 생성합니다.
 * 일반 useMutation과는 다르게 반환되는 데이터 타입, 에러 타입을 자동으로 추론합니다.
 * @template TApiFn ApiClient 메서드 타입 (예: apiClient.createTeam)
 * @param apiFn API 클라이언트 메서드
 */
export function createMutationHook<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TApiFn extends (...args: any[]) => any
>(apiFn: TApiFn) {
  // TData, TError, 그리고 mutationFn이 받을 변수 타입(TVariables)을 추론합니다.
  type TData = ApiSuccessType<TApiFn>
  type TError = ApiErrorType<TApiFn>
  type TVariables = Parameters<TApiFn>[0] // apiFn의 첫 번째 파라미터 타입을 변수 타입으로 지정

  // 실제 사용될 커스텀 훅 함수를 반환합니다.
  // 이 훅은 useMutation의 options 객체만 인자로 받습니다.
  return (
    options?: Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">
  ) => {
    const apiClient = useApiClient()

    return useMutation<TData, TError, TVariables>({
      // mutationFn은 mutate 함수에서 전달받은 variables를 사용합니다.
      mutationFn: (variables: TVariables) =>
        apiFn.bind(apiClient)(variables) as ReturnType<TApiFn>,
      ...options
    })
  }
}
