import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions
} from "@tanstack/react-query"

import { useApiClient } from "@/lib/providers/api-client-provider"
import { ApiErrorType, ApiSuccessType } from "@/types/react-query"

/**
 * 커스텀 쿼리 훅을 생성합니다.
 * 일반 useQuery와는 다르게 반환되는 데이터 타입, 에러 타입을 자동으로 추론합니다.
 * @template TApiFn ApiClient 메서드 타입(예: apiClient.getPerformanceById)
 * @template TArgs 생성될 커스텀 훅이 받을 인자들의 배열 타입 (예: [performanceId: number])
 * @template TMappedData mapper 함수를 통해 변환된 최종 데이터 타입
 * @param apiFn API 클라이언트 메서드
 * @param getQueryKey 쿼리 키 생성 함수
 * @param mapper API 응답을 원하는 형태로 변환하는 함수 (선택적)
 * @returns 커스텀 쿼리 훅
 */
export function createQueryHook<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TApiFn extends (...args: any[]) => any,
  TArgs extends unknown[],
  TMappedData = ApiSuccessType<TApiFn> // 기본값은 원래 API 응답 타입
>(
  apiFn: TApiFn,
  getQueryKey: (...args: TArgs) => QueryKey,
  mapper?: (data: ApiSuccessType<TApiFn>) => TMappedData
) {
  // TData와 TError를 자동으로 추론합니다.
  type TRawData = ApiSuccessType<TApiFn> // API에서 받은 원시 데이터
  type TData = TMappedData // mapper를 거친 최종 데이터
  type TError = ApiErrorType<TApiFn>

  // 실제 사용될 커스텀 훅 함수를 반환합니다.
  return (
    ...argsAndOptions: [
      ...args: TArgs,
      options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">
    ]
  ) => {
    const apiClient = useApiClient()

    const lastArg = argsAndOptions[argsAndOptions.length - 1]
    const isLastArgOptions =
      lastArg &&
      typeof lastArg === "object" &&
      !Array.isArray(lastArg) &&
      ("enabled" in lastArg ||
        "retry" in lastArg ||
        "staleTime" in lastArg ||
        Object.keys(lastArg).length === 0)

    let args: TArgs
    let options:
      | Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">
      | undefined

    if (isLastArgOptions) {
      // 마지막 인자가 options라면 분리
      args = argsAndOptions.slice(0, -1) as TArgs
      options = lastArg as Omit<
        UseQueryOptions<TData, TError>,
        "queryKey" | "queryFn"
      >
    } else {
      // 마지막 인자가 options가 아니라면 모든 인자를 args로 취급
      args = argsAndOptions as unknown as TArgs
      options = undefined
    }

    return useQuery<TData, TError>({
      queryKey: getQueryKey(...args),
      queryFn: async () => {
        const rawData = (await apiFn.bind(apiClient)(...args)) as TRawData
        // mapper가 있으면 적용, 없으면 원본 데이터 반환
        return mapper ? mapper(rawData) : (rawData as unknown as TData)
      },
      ...options
    })
  }
}

/**
 * 커스텀 뮤테이션 훅을 생성합니다.
 * @template TApiFn ApiClient 메서드 타입
 * @template TMappedData mapper 함수를 통해 변환된 최종 데이터 타입
 * @param apiFn API 클라이언트 메서드
 * @param mapper API 응답을 원하는 형태로 변환하는 함수 (선택적)
 */
export function createMutationHook<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TApiFn extends (...args: any[]) => any,
  TMappedData = ApiSuccessType<TApiFn>
>(apiFn: TApiFn, mapper?: (data: ApiSuccessType<TApiFn>) => TMappedData) {
  type TRawData = ApiSuccessType<TApiFn>
  type TData = TMappedData
  type TError = ApiErrorType<TApiFn>
  type TVariables = Parameters<TApiFn>[0]

  return (
    options?: Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">
  ) => {
    const apiClient = useApiClient()

    return useMutation<TData, TError, TVariables>({
      mutationFn: async (variables: TVariables) => {
        const rawData = (await apiFn.bind(apiClient)(variables)) as TRawData
        return mapper ? mapper(rawData) : (rawData as unknown as TData)
      },
      ...options
    })
  }
}
