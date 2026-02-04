# DOC-011: 상태 관리 및 데이터 페칭

> AI 재구성을 위한 상세 명세

---

## 1. 개요

AMANG 프로젝트는 TanStack Query(React Query) v5를 사용하여 서버 상태를 관리합니다. 커스텀 훅 팩토리 패턴을 통해 타입 안전한 API 호출 훅을 자동 생성합니다.

---

## 2. 아키텍처 개요

### 2.1 데이터 플로우

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           React Component                                │
│                               │                                          │
│                               ▼                                          │
│                   usePerformances() / useTeam()                         │
│                               │                                          │
│                               ▼                                          │
│                    TanStack Query (캐시/상태 관리)                        │
│                               │                                          │
│                               ▼                                          │
│                  ApiClient (토큰 자동 관리)                              │
│                               │                                          │
│                               ▼                                          │
│                        NestJS API Server                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Provider 계층 구조

```typescript
<SessionProvider>           {/* next-auth 세션 */}
  <SessionGuard>            {/* 토큰 만료 감지 */}
    <ApiClientProvider>     {/* ApiClient 토큰 동기화 */}
      <ReactQueryProvider>  {/* TanStack Query 캐시 */}
        {children}
      </ReactQueryProvider>
    </ApiClientProvider>
  </SessionGuard>
</SessionProvider>
```

---

## 3. Provider 구현

### 3.1 통합 Providers

**파일 경로**: `apps/web/lib/providers/index.tsx`

```typescript
"use client"

import { SessionProvider, signOut, useSession } from "next-auth/react"
import { useEffect } from "react"
import { ApiClientProvider } from "./api-client-provider"
import ReactQueryProvider from "./react-query-provider"

function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  useEffect(() => {
    // 리프레시 토큰 만료 시 자동 로그아웃
    if (session?.error === "RefreshAccessTokenError") {
      signOut()
    }
  }, [session?.error])

  return children
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionGuard>
        <ApiClientProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </ApiClientProvider>
      </SessionGuard>
    </SessionProvider>
  )
}
```

### 3.2 ApiClient Provider

**파일 경로**: `apps/web/lib/providers/api-client-provider.tsx`

```typescript
"use client"

import { useSession } from "next-auth/react"
import { createContext, ReactNode, useContext, useEffect } from "react"

import { apiClient } from "@/lib/apiClient"
import ApiClient from "@repo/api-client"

const ApiClientContext = createContext<ApiClient | null>(null)

/**
 * 클라이언트 컴포넌트에서 사용
 * 세션의 accessToken이 자동으로 주입된 ApiClient를 반환합니다.
 */
export const useApiClient = () => {
  const context = useContext(ApiClientContext)
  if (!context) {
    throw new Error("useApiClient must be used within ApiClientProvider")
  }
  return context
}

export const ApiClientProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, update } = useSession()

  // 세션의 accessToken이 변경될 때마다 토큰만 업데이트
  useEffect(() => {
    apiClient.setAccessToken(session?.accessToken ?? null)
  }, [session?.accessToken])

  // 토큰 만료 시 세션 갱신 핸들러 설정
  useEffect(() => {
    apiClient.setOnTokenExpired(async () => {
      const newSession = await update()
      return newSession?.accessToken ?? null
    })
  }, [update])

  return (
    <ApiClientContext.Provider value={apiClient}>
      {children}
    </ApiClientContext.Provider>
  )
}
```

### 3.3 ReactQuery Provider

**파일 경로**: `apps/web/lib/providers/react-query-provider.tsx`

```typescript
"use client"

import { getQueryClient } from "@/app/get-query-client"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

export default function ReactQueryProvider({
  children
}: {
  children: React.ReactNode
}) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
```

### 3.4 QueryClient 설정

**파일 경로**: `apps/web/app/get-query-client.ts`

```typescript
import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1분간 fresh 상태 유지
      },
      dehydrate: {
        // pending 쿼리도 dehydration에 포함
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    // 서버: 항상 새 QueryClient 생성
    return makeQueryClient();
  } else {
    // 브라우저: 싱글톤 패턴 (React Suspense 대응)
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
```

---

## 4. ApiClient 싱글톤

**파일 경로**: `apps/web/lib/apiClient.ts`

```typescript
import ApiClient from "@repo/api-client";

/**
 * 서버 컴포넌트에서 사용
 */
export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
);
```

---

## 5. 커스텀 훅 팩토리

### 5.1 타입 유틸리티

**파일 경로**: `apps/web/types/react-query.d.ts`

```typescript
import { PromiseWithError } from "@repo/api-client";

/**
 * ApiClient 메서드에서 에러 타입을 추출합니다.
 */
export type ApiErrorType<
  T extends (...args: any) => PromiseWithError<any, any>,
> = ReturnType<T> extends PromiseWithError<any, infer E> ? E : never;

/**
 * ApiClient 메서드에서 성공 데이터 타입을 추출합니다.
 * Awaited<T>는 Promise가 resolve하는 값의 타입을 반환합니다.
 */
export type ApiSuccessType<
  T extends (...args: any) => PromiseWithError<any, any>,
> = Awaited<ReturnType<T>>;
```

### 5.2 createQueryHook

**파일 경로**: `apps/web/hooks/useCustomQuery.ts`

```typescript
import { useApiClient } from "@/lib/providers/api-client-provider";
import { ApiErrorType, ApiSuccessType } from "@/types/react-query";
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";

/**
 * 커스텀 쿼리 훅을 생성합니다.
 * 일반 useQuery와는 다르게 반환되는 데이터 타입, 에러 타입을 자동으로 추론합니다.
 *
 * @template TApiFn ApiClient 메서드 타입
 * @template TArgs 커스텀 훅이 받을 인자 타입
 * @template TMappedData mapper를 통해 변환된 최종 데이터 타입
 * @param apiFn API 클라이언트 메서드
 * @param getQueryKey 쿼리 키 생성 함수
 * @param mapper API 응답을 원하는 형태로 변환하는 함수 (선택적)
 */
export function createQueryHook<
  TApiFn extends (...args: any[]) => any,
  TArgs extends unknown[],
  TMappedData = ApiSuccessType<TApiFn>,
>(
  apiFn: TApiFn,
  getQueryKey: (...args: TArgs) => QueryKey,
  mapper?: (data: ApiSuccessType<TApiFn>) => TMappedData,
) {
  type TRawData = ApiSuccessType<TApiFn>;
  type TData = TMappedData;
  type TError = ApiErrorType<TApiFn>;

  return (
    ...argsAndOptions: [
      ...args: TArgs,
      options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">,
    ]
  ) => {
    const apiClient = useApiClient();

    // 마지막 인자가 options인지 구분
    const lastArg = argsAndOptions[argsAndOptions.length - 1];
    const isLastArgOptions =
      lastArg &&
      typeof lastArg === "object" &&
      !Array.isArray(lastArg) &&
      ("enabled" in lastArg ||
        "retry" in lastArg ||
        "staleTime" in lastArg ||
        Object.keys(lastArg).length === 0);

    let args: TArgs;
    let options:
      | Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">
      | undefined;

    if (isLastArgOptions) {
      args = argsAndOptions.slice(0, -1) as TArgs;
      options = lastArg as typeof options;
    } else {
      args = argsAndOptions as unknown as TArgs;
      options = undefined;
    }

    return useQuery<TData, TError>({
      queryKey: getQueryKey(...args),
      queryFn: async () => {
        const rawData = (await apiFn.bind(apiClient)(...args)) as TRawData;
        return mapper ? mapper(rawData) : (rawData as unknown as TData);
      },
      ...options,
    });
  };
}
```

### 5.3 createMutationHook

```typescript
/**
 * 커스텀 뮤테이션 훅을 생성합니다.
 *
 * @template TApiFn ApiClient 메서드 타입
 * @template TMappedData mapper를 통해 변환된 최종 데이터 타입
 * @param apiFn API 클라이언트 메서드
 * @param mapper API 응답을 원하는 형태로 변환하는 함수 (선택적)
 */
export function createMutationHook<
  TApiFn extends (...args: any[]) => any,
  TMappedData = ApiSuccessType<TApiFn>,
>(apiFn: TApiFn, mapper?: (data: ApiSuccessType<TApiFn>) => TMappedData) {
  type TRawData = ApiSuccessType<TApiFn>;
  type TData = TMappedData;
  type TError = ApiErrorType<TApiFn>;
  type TVariables = Parameters<TApiFn>;

  return (
    options?: Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">,
  ) => {
    const apiClient = useApiClient();

    return useMutation<TData, TError, TVariables>({
      mutationFn: async (variables: TVariables) => {
        const rawData = (await apiFn.bind(apiClient)(...variables)) as TRawData;
        return mapper ? mapper(rawData) : (rawData as unknown as TData);
      },
      ...options,
    });
  };
}
```

---

## 6. 도메인별 API 훅

### 6.1 Performance 훅

**파일 경로**: `apps/web/hooks/api/usePerformance.ts`

```typescript
import { mapPerformance, mapPerformances } from "@/hooks/api/mapper";
import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery";
import ApiClient from "@repo/api-client";

// 목록 조회
export const usePerformances = createQueryHook(
  ApiClient.prototype.getPerformances,
  () => ["performances"],
  mapPerformances, // Date 변환 적용
);

// 상세 조회
export const usePerformance = createQueryHook(
  ApiClient.prototype.getPerformanceById,
  (performanceId: number) => ["performance", performanceId],
  mapPerformance,
);

// 생성
export const useCreatePerformance = createMutationHook(
  ApiClient.prototype.createPerformance,
  mapPerformance,
);

// 수정
export const useUpdatePerformance = createMutationHook(
  ApiClient.prototype.updatePerformance,
  mapPerformance,
);

// 삭제
export const useDeletePerformance = createMutationHook(
  ApiClient.prototype.deletePerformance,
  mapPerformance,
);
```

### 6.2 Team 훅

**파일 경로**: `apps/web/hooks/api/useTeam.ts`

```typescript
import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery";
import ApiClient from "@repo/api-client";

// 생성
export const useCreateTeam = createMutationHook(ApiClient.prototype.createTeam);

// 공연별 팀 목록 조회
export const useTeams = createQueryHook(
  ApiClient.prototype.getTeamsByPerformance,
  (performanceId: number) => ["teams", "performance", performanceId],
);

// 단일 팀 조회
export const useTeam = createQueryHook(
  ApiClient.prototype.getTeamById,
  (teamId: number) => ["team", teamId],
);

// 수정
export const useUpdateTeam = createMutationHook(ApiClient.prototype.updateTeam);

// 삭제
export const useDeleteTeam = createMutationHook(ApiClient.prototype.deleteTeam);

// 팀 지원
export const useApplyToTeam = createMutationHook(
  ApiClient.prototype.applyToTeam,
);

// 팀 지원 취소
export const useUnapplyFromTeam = createMutationHook(
  ApiClient.prototype.unapplyFromTeam,
);
```

---

## 7. 데이터 변환 (Mapper)

### 7.1 변환이 필요한 이유

HTTP JSON 전송 시 `Date` 객체가 ISO 문자열로 직렬화됩니다. 클라이언트에서 `Date` 객체로 사용하려면 역변환이 필요합니다.

### 7.2 Mapper 구현

**파일 경로**: `apps/web/hooks/api/mapper.ts`

```typescript
import { Performance, Session, User } from "@repo/shared-types";

// 타입 정의
type FieldTransformer<TInput = any, TOutput = any> = (value: TInput) => TOutput;

type SerializedType<T> = T extends Date
  ? string
  : T extends Date | undefined
    ? string | undefined
    : T extends Date | null
      ? string | null
      : T;

type Serialized<T> = {
  [K in keyof T]: SerializedType<T[K]>;
};

type TransformResult<TConfig> = {
  [K in keyof TConfig]: TConfig[K] extends FieldTransformer<any, infer TOutput>
    ? TOutput
    : never;
};

type MapperResult<TOriginal, TConfig> = Serialized<TOriginal> &
  TransformResult<TConfig>;

/**
 * 기본 변환 함수들
 */
export const FIELD_TRANSFORMERS = {
  // Date 변환
  toDate: (value: string): Date => new Date(value),
  toOptionalDate: (value?: string): Date | undefined =>
    value ? new Date(value) : undefined,
  toNullableDate: (value?: string | null): Date | null =>
    value ? new Date(value) : null,

  // Number 변환
  toNumber: (value: string): number => Number(value),
  toOptionalNumber: (value?: string): number | undefined =>
    value !== undefined ? Number(value) : undefined,

  // Boolean 변환
  toBoolean: (value: string): boolean => value === "true",
  toOptionalBoolean: (value?: string): boolean | undefined =>
    value !== undefined ? value === "true" : undefined,

  // Array 변환
  parseJsonArray: <T>(value: string): T[] => JSON.parse(value),
  parseOptionalJsonArray: <T>(value?: string): T[] | undefined =>
    value ? JSON.parse(value) : undefined,

  // Object 변환
  parseJsonObject: <T>(value: string): T => JSON.parse(value),
  parseOptionalJsonObject: <T>(value?: string): T | undefined =>
    value ? JSON.parse(value) : undefined,

  // 중첩 객체 매핑
  mapNested:
    <TInput, TOutput>(mapper: (input: TInput) => TOutput) =>
    (value: TInput): TOutput =>
      mapper(value),
  mapOptionalNested:
    <TInput, TOutput>(mapper: (input: TInput) => TOutput) =>
    (value?: TInput): TOutput | undefined =>
      value ? mapper(value) : undefined,
  mapNestedArray:
    <TInput, TOutput>(mapper: (input: TInput) => TOutput) =>
    (value: TInput[]): TOutput[] =>
      value.map(mapper),
} as const;

/**
 * 각 모델별 변환 설정
 */
export const TRANSFORM_CONFIGS = {
  performance: {
    startAt: FIELD_TRANSFORMERS.toNullableDate,
    endAt: FIELD_TRANSFORMERS.toNullableDate,
    createdAt: FIELD_TRANSFORMERS.toDate,
    updatedAt: FIELD_TRANSFORMERS.toDate,
  },

  user: {
    createdAt: FIELD_TRANSFORMERS.toDate,
    updatedAt: FIELD_TRANSFORMERS.toDate,
  },

  session: {
    createdAt: FIELD_TRANSFORMERS.toDate,
    updatedAt: FIELD_TRANSFORMERS.toDate,
  },
} as const;

/**
 * 설정 기반 범용 매퍼 생성 함수
 */
function createConfigBasedMapper<
  TOriginal,
  TConfig extends Record<string, FieldTransformer>,
>(
  transformConfig: TConfig,
  debugMode: boolean = process.env.NODE_ENV === "development",
): (rawData: any) => MapperResult<TOriginal, TConfig> {
  return function mapWithConfig(
    rawData: any,
  ): MapperResult<TOriginal, TConfig> {
    const result = { ...rawData } as any;

    if (debugMode) {
      console.group("🔄 Data Transform");
      console.log("Raw data:", rawData);
    }

    Object.entries(transformConfig).forEach(([fieldName, transformer]) => {
      if (fieldName in result && transformer) {
        try {
          const originalValue = result[fieldName];
          result[fieldName] = transformer(result[fieldName]);

          if (debugMode && originalValue !== result[fieldName]) {
            console.log(
              `📝 ${fieldName}:`,
              originalValue,
              "→",
              result[fieldName],
            );
          }
        } catch (error) {
          console.warn(`Failed to transform field '${fieldName}':`, error);
        }
      }
    });

    if (debugMode) {
      console.groupEnd();
    }

    return result as MapperResult<TOriginal, TConfig>;
  };
}

/**
 * 배열용 매퍼 생성 함수
 */
function createArrayConfigBasedMapper<
  TOriginal,
  TConfig extends Record<string, FieldTransformer>,
>(
  transformConfig: TConfig,
  debugMode: boolean = process.env.NODE_ENV === "development",
): (rawArray: any[]) => MapperResult<TOriginal, TConfig>[] {
  const singleMapper = createConfigBasedMapper<TOriginal, TConfig>(
    transformConfig,
    false,
  );

  return function mapArrayWithConfig(
    rawArray: any[],
  ): MapperResult<TOriginal, TConfig>[] {
    if (debugMode) {
      console.group(`🔄 Array Transform (${rawArray.length} items)`);
    }

    const result = rawArray.map(singleMapper);

    if (debugMode) {
      console.groupEnd();
    }

    return result;
  };
}

// 각 모델별 매퍼 생성
export const mapPerformance = createConfigBasedMapper<
  Performance,
  typeof TRANSFORM_CONFIGS.performance
>(TRANSFORM_CONFIGS.performance);

export const mapPerformances = createArrayConfigBasedMapper<
  Performance,
  typeof TRANSFORM_CONFIGS.performance
>(TRANSFORM_CONFIGS.performance);

export const mapUser = createConfigBasedMapper<
  User,
  typeof TRANSFORM_CONFIGS.user
>(TRANSFORM_CONFIGS.user);

export const mapUsers = createArrayConfigBasedMapper<
  User,
  typeof TRANSFORM_CONFIGS.user
>(TRANSFORM_CONFIGS.user);

export const mapSession = createConfigBasedMapper<
  Session,
  typeof TRANSFORM_CONFIGS.session
>(TRANSFORM_CONFIGS.session);

export const mapSessions = createArrayConfigBasedMapper<
  Session,
  typeof TRANSFORM_CONFIGS.session
>(TRANSFORM_CONFIGS.session);
```

---

## 8. Query Key 전략

### 8.1 Query Key 컨벤션

```typescript
// 목록: ["엔티티s"]
["performances"][("teams", "performance", performanceId)][
  // 단일 엔티티: ["엔티티", id]
  ("performance", 1)
][("team", 5)][
  // 필터링된 목록: ["엔티티s", "필터", 필터값]
  ("teams", "performance", 1)
][("rentals", "equipment", 3)][
  // 사용자별 데이터: ["엔티티s", "user", userId]
  ("applications", "user", 10)
];
```

### 8.2 Query Key 패턴 예시

| 훅                  | Query Key                     |
| ------------------- | ----------------------------- |
| `usePerformances()` | `["performances"]`            |
| `usePerformance(1)` | `["performance", 1]`          |
| `useTeams(1)`       | `["teams", "performance", 1]` |
| `useTeam(5)`        | `["team", 5]`                 |

---

## 9. 캐시 무효화 패턴

### 9.1 Mutation 후 캐시 무효화

```typescript
import { useQueryClient } from "@tanstack/react-query";

const CreateTeamPage = () => {
  const queryClient = useQueryClient();
  const createTeam = useCreateTeam();

  const handleSubmit = async (data: CreateTeam) => {
    await createTeam.mutateAsync([data], {
      onSuccess: () => {
        // 팀 목록 캐시 무효화
        queryClient.invalidateQueries({
          queryKey: ["teams", "performance", data.performanceId],
        });
      },
    });
  };
};
```

### 9.2 관련 쿼리 일괄 무효화

```typescript
const handleDeleteTeam = async (teamId: number, performanceId: number) => {
  await deleteTeam.mutateAsync([teamId], {
    onSuccess: () => {
      // 개별 팀 캐시 제거
      queryClient.removeQueries({ queryKey: ["team", teamId] });
      // 팀 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["teams", "performance", performanceId],
      });
    },
  });
};
```

---

## 10. 사용 예시

### 10.1 Query 사용

```typescript
"use client"

import { usePerformances } from "@/hooks/api/usePerformance"

const PerformanceList = () => {
  const { data: performances, isLoading, isError } = usePerformances()

  if (isLoading) return <Loading />
  if (isError) return <Error />

  return (
    <div>
      {performances?.map((p) => (
        <PerformanceCard
          key={p.id}
          id={p.id}
          name={p.name}
          startAt={p.startAt}  // Date 타입 (mapper에 의해 변환됨)
        />
      ))}
    </div>
  )
}
```

### 10.2 Query with Options

```typescript
const TeamList = ({ performanceId }: { performanceId: number }) => {
  const { data: teams } = useTeams(performanceId, {
    enabled: !!performanceId, // performanceId가 있을 때만 실행
    staleTime: 5 * 60 * 1000, // 5분간 fresh
    refetchOnWindowFocus: true,
  });

  // ...
};
```

### 10.3 Mutation 사용

```typescript
"use client"

import { useApplyToTeam } from "@/hooks/api/useTeam"
import { DuplicateApplicationError, PositionOccupiedError } from "@repo/api-client"

const TeamApply = ({ teamId }: { teamId: number }) => {
  const applyToTeam = useApplyToTeam()

  const handleApply = async (application: TeamApplication) => {
    try {
      await applyToTeam.mutateAsync([teamId, application])
      toast.success("지원이 완료되었습니다")
    } catch (error) {
      if (error instanceof DuplicateApplicationError) {
        toast.error("이미 해당 세션에 지원하셨습니다")
      } else if (error instanceof PositionOccupiedError) {
        toast.error("해당 자리는 다른 분이 먼저 지원했습니다")
      } else {
        toast.error("지원 중 오류가 발생했습니다")
      }
    }
  }

  return (
    <Button
      onClick={() => handleApply(selectedSessions)}
      disabled={applyToTeam.isPending}
    >
      {applyToTeam.isPending ? "지원 중..." : "지원하기"}
    </Button>
  )
}
```

### 10.4 Mutation with Callbacks

```typescript
const useCreateTeamWithCallbacks = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useCreateTeam({
    onSuccess: (data) => {
      // 성공 시 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["teams", "performance", data.performanceId],
      });
      // 상세 페이지로 이동
      router.push(ROUTES.PERFORMANCE.TEAM.DETAIL(data.performanceId, data.id));
      toast.success("팀이 생성되었습니다");
    },
    onError: (error) => {
      if (error instanceof ReferencedEntityNotFoundError) {
        toast.error("존재하지 않는 리더 또는 세션입니다");
      } else {
        toast.error("팀 생성에 실패했습니다");
      }
    },
  });
};
```

---

## 11. 훅 파일 구조

```
apps/web/hooks/
├── api/
│   ├── mapper.ts              # 데이터 변환 유틸리티
│   ├── usePerformance.ts      # Performance 훅
│   ├── useTeam.ts             # Team 훅
│   ├── useUser.ts             # User 훅
│   ├── useSession.ts          # Session 훅
│   └── useGeneration.ts       # Generation 훅
└── useCustomQuery.ts          # 훅 팩토리 함수
```

---

## 12. AI 구현 체크리스트

### 12.1 새 API 훅 추가 시

- [ ] `useCustomQuery.ts`의 `createQueryHook` 또는 `createMutationHook` 사용
- [ ] 적절한 Query Key 정의
- [ ] Date 필드가 있으면 mapper 추가
- [ ] `apps/web/hooks/api/` 디렉토리에 파일 생성

### 12.2 Query Key 정의 시

- [ ] 엔티티 복수형 + id 패턴 사용
- [ ] 관계있는 데이터는 부모 엔티티 포함
- [ ] 필터링 정보 포함

### 12.3 Mapper 추가 시

- [ ] `TRANSFORM_CONFIGS`에 설정 추가
- [ ] `createConfigBasedMapper` 또는 `createArrayConfigBasedMapper` 사용
- [ ] Date, nullable Date 구분

### 12.4 캐시 무효화 시

- [ ] 생성/수정 후 목록 쿼리 무효화
- [ ] 삭제 후 개별 쿼리 제거 + 목록 무효화
- [ ] 관련 엔티티 캐시도 함께 처리

---

## 13. 관련 파일 목록

| 파일 경로                                         | 역할                |
| ------------------------------------------------- | ------------------- |
| `apps/web/lib/providers/index.tsx`                | Provider 통합       |
| `apps/web/lib/providers/api-client-provider.tsx`  | ApiClient Provider  |
| `apps/web/lib/providers/react-query-provider.tsx` | ReactQuery Provider |
| `apps/web/app/get-query-client.ts`                | QueryClient 설정    |
| `apps/web/lib/apiClient.ts`                       | ApiClient 싱글톤    |
| `apps/web/hooks/useCustomQuery.ts`                | 훅 팩토리           |
| `apps/web/hooks/api/mapper.ts`                    | 데이터 변환         |
| `apps/web/hooks/api/useTeam.ts`                   | Team API 훅         |
| `apps/web/hooks/api/usePerformance.ts`            | Performance API 훅  |
| `apps/web/types/react-query.d.ts`                 | 타입 유틸리티       |
