# API Hooks (`web/hooks/api`)

## 목차

1. [용도](#용도)
2. [주요 기능](#주요-기능)
3. [아키텍처](#아키텍처)
4. [파일 구조](#파일-구조)
5. [사용 방법](#사용-방법)
6. [Mapper 시스템](#mapper-시스템)
7. [새로운 API 추가하기](#새로운-api-추가하기)

## 용도

Web 어플리케이션에서 API를 호출하는 기능을 구현하기 위한 코드입니다. 이 코드는 API 클라이언트와 관련된 메서드를 정의하고, API 요청을 처리합니다.

### 이 API Client를 사용하는 이유

- **일관성**: 모든 API 호출을 동일한 방식으로 처리하여 코드의 일관성을 유지합니다.
- **타입 안전성**: TypeScript를 활용하여 컴파일 타임에 API 계약을 검증하고, 자동 완성 및 IntelliSense를 제공합니다.
- **에러 처리**: API 호출 시 발생할 수 있는 에러를 JsDoc 주석으로 문서화하고, 이를 통해 개발자가 API 호출 시 어떤 에러가 발생할 수 있는지 명확히 이해할 수 있도록 합니다.
- **데이터 변환**: HTTP 전송 과정에서 변경된 타입(예: Date → string)을 자동으로 복원합니다.
- **캐싱 및 상태 관리**: React Query를 활용하여 효율적인 데이터 페칭, 캐싱, 동기화를 제공합니다.

## 주요 기능

- **API 클라이언트 인스턴스 생성 및 관리**: 싱글톤 패턴을 통한 중앙 집중식 API 관리
- **API 응답에 대한 에러 처리 및 변환**: 타입 안전한 에러 처리
- **HTTP JSON 직렬화로 인한 타입 변경 복원**: Date 문자열을 Date 객체로 자동 변환
- **React Query 기반 캐싱 및 상태 관리**: 자동 리페치, 백그라운드 업데이트, 낙관적 업데이트 지원

## 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    React Component                      │
│  - 데이터 렌더링                                          │
│  - 이벤트 핸들링                                          │
└─────────────────────┬───────────────────────────────────┘
                      │ usePerformance(id)
                      ↓
┌─────────────────────────────────────────────────────────┐
│              Custom Hook (usePerformance.ts)            │
│  - createQueryHook/createMutationHook 사용              │
│  - mapper 함수 적용                                      │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│          Hook Factory (useCustomQuery.ts)               │
│  - React Query 훅 생성                                   │
│  - 타입 자동 추론                                         │
└─────────────────────┬───────────────────────────────────┘
                      │ apiClient.getPerformanceById(id)
                      ↓
┌─────────────────────────────────────────────────────────┐
│              API Client (@repo/api-client)              │
│  - HTTP 요청 처리                                         │
│  - 에러 변환                                             │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP GET /performances/:id
                      ↓
┌─────────────────────────────────────────────────────────┐
│                   Backend API                           │
└─────────────────────────────────────────────────────────┘
```

## 파일 구조

```
apps/web/hooks/api/
├── README.md              # 이 문서
├── mapper.ts              # 데이터 변환 함수 및 설정
├── usePerformance.ts      # 공연 관련 API 훅
├── useTeam.ts             # 팀 관련 API 훅
├── useSession.ts          # 세션 관련 API 훅
├── useUser.ts             # 유저 관련 API 훅
└── useGeneration.ts       # 기수 관련 API 훅
```

## 사용 방법

### Query Hook (데이터 조회)

```typescript
import { usePerformance } from "@/hooks/api/usePerformance"

function PerformanceDetail({ id }: { id: number }) {
  // 훅 호출 - React Query 옵션도 전달 가능
  const { data: performance, isLoading, isError } = usePerformance(id, {
    staleTime: 5000,
    retry: 3
  })

  if (isLoading) return <div>로딩 중...</div>
  if (isError) return <div>에러 발생</div>
  if (!performance) return <div>데이터 없음</div>

  // performance.createdAt는 Date 객체 (mapper 적용됨)
  return (
    <div>
      <h1>{performance.name}</h1>
      <p>생성일: {performance.createdAt.toLocaleDateString()}</p>
    </div>
  )
}
```

### Mutation Hook (데이터 변경)

```typescript
import { useCreatePerformance } from "@/hooks/api/usePerformance"
import { useQueryClient } from "@tanstack/react-query"

function CreatePerformanceForm() {
  const queryClient = useQueryClient()

  const { mutate: createPerformance, isPending } = useCreatePerformance({
    onSuccess: (newPerformance) => {
      // 성공 시 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["performances"] })

      // newPerformance.createdAt는 Date 객체
      console.log("생성됨:", newPerformance.createdAt)
    },
    onError: (error) => {
      // 타입 안전한 에러 처리
      if (error instanceof ValidationError) {
        alert("입력값을 확인해주세요")
      }
    }
  })

  const handleSubmit = (data: CreatePerformance) => {
    createPerformance(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? "생성 중..." : "생성"}
      </button>
    </form>
  )
}
```

## Mapper 시스템

### 왜 Mapper가 필요한가?

HTTP를 통해 데이터를 전송할 때, JavaScript의 `Date` 객체는 자동으로 ISO 8601 문자열로 변환됩니다:

```typescript
// Backend (NestJS)에서 보낸 데이터
{
  id: 1,
  name: "공연",
  createdAt: new Date("2024-01-01")  // Date 객체
}

// HTTP 전송 후 Frontend에서 받은 데이터
{
  id: 1,
  name: "공연",
  createdAt: "2024-01-01T00:00:00.000Z"  // string으로 변환됨
}
```

이 문자열을 다시 Date 객체로 변환하지 않으면, Date 메서드(`toLocaleDateString()` 등)를 사용할 수 없습니다.

### Mapper 구조

#### 1. 필드별 변환 함수 (FIELD_TRANSFORMERS)

```typescript
export const FIELD_TRANSFORMERS = {
  // Date 변환
  toDate: (value: string): Date => new Date(value),
  toOptionalDate: (value?: string): Date | undefined =>
    value ? new Date(value) : undefined,
  toNullableDate: (value?: string | null): Date | null =>
    value ? new Date(value) : null

  // 기타 변환 함수들...
}
```

#### 2. 모델별 변환 설정 (TRANSFORM_CONFIGS)

```typescript
export const TRANSFORM_CONFIGS = {
  performance: {
    startAt: FIELD_TRANSFORMERS.toNullableDate,
    endAt: FIELD_TRANSFORMERS.toNullableDate,
    createdAt: FIELD_TRANSFORMERS.toDate,
    updatedAt: FIELD_TRANSFORMERS.toDate
  },

  user: {
    createdAt: FIELD_TRANSFORMERS.toDate,
    updatedAt: FIELD_TRANSFORMERS.toDate
  },

  session: {
    createdAt: FIELD_TRANSFORMERS.toDate,
    updatedAt: FIELD_TRANSFORMERS.toDate
  },

  generation: {
    createdAt: FIELD_TRANSFORMERS.toDate,
    updatedAt: FIELD_TRANSFORMERS.toDate
  }
}
```

#### 3. Mapper 함수 생성

```typescript
// 단일 객체 변환
export const mapPerformance = createConfigBasedMapper<
  Performance,
  typeof TRANSFORM_CONFIGS.performance
>(TRANSFORM_CONFIGS.performance)

// 배열 변환
export const mapPerformances = createArrayConfigBasedMapper<
  Performance,
  typeof TRANSFORM_CONFIGS.performance
>(TRANSFORM_CONFIGS.performance)
```

### Mapper 적용

Custom Hook에서 mapper를 세 번째 인자로 전달합니다:

```typescript
// 단일 객체 조회
export const usePerformance = createQueryHook(
  ApiClient.prototype.getPerformanceById,
  (performanceId: number) => ["performance", performanceId],
  mapPerformance // 👈 mapper 적용
)

// 배열 조회
export const usePerformances = createQueryHook(
  ApiClient.prototype.getPerformances,
  () => ["performances"],
  mapPerformances // 👈 배열 mapper 적용
)

// 생성/수정
export const useCreatePerformance = createMutationHook(
  ApiClient.prototype.createPerformance,
  mapPerformance // 👈 mapper 적용
)
```

## 새로운 API 추가하기

### 1. Shared Types 확인

먼저 `@repo/shared-types`에 타입이 정의되어 있는지 확인합니다.

```typescript
// packages/shared-types/src/models.type.ts
export type { MyEntity } from "@repo/database"
```

### 2. API Client 메서드 확인

`@repo/api-client`에 메서드가 정의되어 있는지 확인합니다.

```typescript
// packages/api-client/src/index.ts
/**
 * 엔티티 조회
 * @throws {NotFoundError} 엔티티가 존재하지 않는 경우
 * @throws {InternalServerError} 서버 오류 발생 시
 */
public getMyEntityById(id: number) {
  return this._request<
    MyEntity,
    NotFoundError | InternalServerError
  >(`/my-entities/${id}`, "GET")
}
```

### 3. Mapper 설정 추가 (필요시)

엔티티에 Date 필드가 있다면 `mapper.ts`에 설정을 추가합니다.

```typescript
// apps/web/hooks/api/mapper.ts

// 1. 타입 import
import { MyEntity } from "@repo/shared-types"

// 2. 변환 설정 추가
export const TRANSFORM_CONFIGS = {
  // ... 기존 설정
  myEntity: {
    createdAt: FIELD_TRANSFORMERS.toDate,
    updatedAt: FIELD_TRANSFORMERS.toDate
  }
}

// 3. Mapper 함수 생성
export const mapMyEntity = createConfigBasedMapper<
  MyEntity,
  typeof TRANSFORM_CONFIGS.myEntity
>(TRANSFORM_CONFIGS.myEntity)

export const mapMyEntities = createArrayConfigBasedMapper<
  MyEntity,
  typeof TRANSFORM_CONFIGS.myEntity
>(TRANSFORM_CONFIGS.myEntity)
```

### 4. Custom Hook 생성

새 파일 `useMyEntity.ts`를 생성합니다.

```typescript
// apps/web/hooks/api/useMyEntity.ts
import { mapMyEntity, mapMyEntities } from "@/hooks/api/mapper"
import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"
import ApiClient from "@repo/api-client"

// Create
export const useCreateMyEntity = createMutationHook(
  ApiClient.prototype.createMyEntity,
  mapMyEntity
)

// List
export const useMyEntities = createQueryHook(
  ApiClient.prototype.getMyEntities,
  () => ["myEntities"],
  mapMyEntities
)

// Get
export const useMyEntity = createQueryHook(
  ApiClient.prototype.getMyEntityById,
  (entityId: number) => ["myEntity", entityId],
  mapMyEntity
)

// Update
export const useUpdateMyEntity = createMutationHook(
  ApiClient.prototype.updateMyEntity,
  mapMyEntity
)

// Delete
export const useDeleteMyEntity = createMutationHook(
  ApiClient.prototype.deleteMyEntity,
  mapMyEntity
)
```

### 5. Component에서 사용

```typescript
import { useMyEntity } from "@/hooks/api/useMyEntity"

function MyEntityDetail({ id }: { id: number }) {
  const { data: entity } = useMyEntity(id)

  return (
    <div>
      <h1>{entity?.name}</h1>
      {/* entity.createdAt는 Date 객체 */}
      <p>{entity?.createdAt.toLocaleDateString()}</p>
    </div>
  )
}
```

## 참고 사항

### Mapper를 적용하지 않는 경우

다음과 같은 경우 mapper를 적용하지 않아도 됩니다:

```typescript
// 모든 필드가 원시 타입인 경우
export const useSimpleEntity = createQueryHook(
  ApiClient.prototype.getSimpleEntity,
  (id: number) => ["simpleEntity", id]
  // mapper 없음
)
```

### React Query 옵션

모든 커스텀 훅은 React Query의 옵션을 마지막 인자로 받을 수 있습니다:

```typescript
// Query 옵션
const { data } = useMyEntity(id, {
  staleTime: 5000, // 5초 동안 fresh 상태 유지
  retry: 3, // 실패 시 3번 재시도
  enabled: !!id // id가 있을 때만 쿼리 실행
})

// Mutation 옵션
const { mutate } = useCreateMyEntity({
  onSuccess: (data) => {
    // 성공 시 콜백
  },
  onError: (error) => {
    // 실패 시 콜백
  }
})
```

### 에러 처리

API Client의 JSDoc `@throws` 태그를 통해 발생 가능한 에러를 확인할 수 있습니다:

```typescript
const { error } = useMyEntity(id)

if (error) {
  if (error instanceof NotFoundError) {
    // 404 에러 처리
  } else if (error instanceof AuthError) {
    // 인증 에러 처리
  }
}
```

## 관련 문서

프로젝트 전체 아키텍처에 대한 자세한 내용은 [ARCHITECTURE.md](../../../ARCHITECTURE.md)를 참조하세요.
