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
 * @template TArgs 생성될 커스텀 훅이 받을 인자들의 배열 타입 (예: [teamData: CreateTeam])
 * @param apiFn
 * @param getMutationKey
 * @returns
 */
export function createMutationHook<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TApiFn extends (...args: any[]) => any,
  TArgs extends unknown[]
>(apiFn: TApiFn, getMutationKey: (...args: TArgs) => QueryKey) {
  // TData와 TError를 자동으로 추론합니다.
  type TData = ApiSuccessType<TApiFn>
  type TError = ApiErrorType<TApiFn>

  // 실제 사용될 커스텀 훅 함수를 반환합니다.
  return (
    options?: Omit<
      UseMutationOptions<TData, TError>,
      "mutationKey" | "mutationFn"
    >,
    ...args: TArgs
  ) => {
    const apiClient = useApiClient()

    return useMutation<TData, TError>({
      mutationKey: getMutationKey(...args),
      // apiFn을 apiClient 인스턴스에 바인딩하여 호출합니다.
      mutationFn: () => apiFn.bind(apiClient)(...args) as ReturnType<TApiFn>,
      ...options
    })
  }
}

/**
 * 공연 정보 조회를 위한 커스텀 훅 (팩토리로 생성됨)
 * @param performanceId 조회할 공연의 ID
 * @param enabled 쿼리 활성화 여부
 */
export const usePerformance = createQueryHook(
  // 1. 사용할 ApiClient 메서드 전달
  useApiClient.prototype.getPerformanceById,
  // 2. 인자(args)를 받아 쿼리 키를 생성하는 함수 전달
  (performanceId: number) => ["performance", performanceId]
)

/**
 * 모든 공연 목록 조회를 위한 커스텀 훅 (팩토리로 생성됨)
 */
export const usePerformances = createQueryHook(
  useApiClient.prototype.getPerformances,
  () => ["performances"]
)
