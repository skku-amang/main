# 아키텍처 문서

## 개요

이 프로젝트는 백엔드(NestJS)와 프론트엔드(Next.js)를 타입 안전하게 연결하는 아키텍처를 사용합니다.
코드 기반의 API 문서를 통해 백엔드와 프론트엔드 간의 계약을 명확히 정의하고, 타입 안전성을 보장합니다.

## 아키텍처 레이어

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                  │
├─────────────────────────────────────────────────────────┤
│  1. UI Components (React Components)                    │
│     - 사용자 인터페이스 렌더링                             │
│     - 이벤트 핸들링                                        │
├─────────────────────────────────────────────────────────┤
│  2. Custom Hooks (usePerformance, useUser, etc.)        │
│     - React Query 기반 데이터 페칭                        │
│     - 캐싱 및 상태 관리                                    │
│     - 데이터 매핑 (mapper 함수 적용)                       │
├─────────────────────────────────────────────────────────┤
│  3. Hook Factory (createQueryHook, createMutationHook)  │
│     - 재사용 가능한 훅 생성 팩토리                          │
│     - 타입 추론 및 에러 처리                               │
├─────────────────────────────────────────────────────────┤
│  4. Mapper Functions (mapper.ts)                        │
│     - HTTP JSON 직렬화된 데이터 변환                       │
│     - Date 문자열 → Date 객체 변환                        │
├─────────────────────────────────────────────────────────┤
│  5. API Client (@repo/api-client)                       │
│     - 타입 안전한 HTTP 요청                               │
│     - 에러 타입 정의 및 변환                               │
│     - JSDoc 기반 API 문서화                               │
├─────────────────────────────────────────────────────────┤
│  6. Shared Types (@repo/shared-types)                   │
│     - 백엔드/프론트엔드 공유 타입 정의                       │
└─────────────────────────────────────────────────────────┘
                            ↕ HTTP
┌─────────────────────────────────────────────────────────┐
│                     Backend (NestJS)                    │
│  - RESTful API                                          │
│  - 데이터 검증                                            │
│  - 비즈니스 로직                                          │
└─────────────────────────────────────────────────────────┘
```

## 1. API Client (`@repo/api-client`)

### 역할

- 백엔드 API와의 통신을 담당하는 타입 안전한 클라이언트
- 모든 API 엔드포인트에 대한 메서드 제공
- JSDoc을 통한 API 문서화
- 에러 타입을 명시하여 컴파일 타임에 에러 처리 강제

### 주요 기능

#### 타입 안전한 에러 처리

```typescript
/**
 * 공연 생성
 * @throws {ValidationError} 입력값이 올바르지 않은 경우
 * @throws {AuthError} 로그인 하지 않은 경우
 * @throws {ForbiddenError} 공연 생성 권한이 없는 경우
 * @throws {InternalServerError} 서버 오류 발생 시
 */
public createPerformance(performanceData: CreatePerformance) {
  return this._request<
    PerformanceDetail,
    ValidationError | AuthError | ForbiddenError | InternalServerError
  >(`/performances`, "POST", performanceData)
}
```

#### API 응답 처리

- 서버의 `ApiResult<T>` 형식 응답을 자동으로 파싱
- 성공 시 `data` 반환, 실패 시 `ProblemDocument`를 JavaScript Error로 변환

### 위치

`packages/api-client/src/index.ts`

## 2. Mapper Functions (`apps/web/hooks/api/mapper.ts`)

### 역할

HTTP 전송 과정에서 JSON 직렬화로 인해 변경된 타입을 복원합니다.

### 문제 상황

HTTP를 통해 데이터를 전송할 때, JavaScript의 `Date` 객체는 자동으로 문자열로 변환됩니다:

```typescript
// Backend에서 보낸 데이터
{
  createdAt: Date;
}

// HTTP 전송 후 Frontend에서 받은 데이터
{
  createdAt: "2024-01-01T00:00:00.000Z";
}
```

### 해결 방법

Mapper 함수를 사용하여 문자열을 다시 Date 객체로 변환합니다.

### 구조

#### 1. 필드별 변환 함수 (FIELD_TRANSFORMERS)

```typescript
export const FIELD_TRANSFORMERS = {
  // Date 변환
  toDate: (value: string): Date => new Date(value),
  toOptionalDate: (value?: string): Date | undefined =>
    value ? new Date(value) : undefined,
  toNullableDate: (value?: string | null): Date | null =>
    value ? new Date(value) : null,

  // Number, Boolean, JSON 등 다양한 타입 변환 지원
};
```

#### 2. 모델별 변환 설정 (TRANSFORM_CONFIGS)

```typescript
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
};
```

#### 3. 타입 안전한 매퍼 생성

```typescript
// 단일 객체 매퍼
export const mapPerformance = createConfigBasedMapper<
  Performance,
  typeof TRANSFORM_CONFIGS.performance
>(TRANSFORM_CONFIGS.performance);

// 배열 매퍼
export const mapPerformances = createArrayConfigBasedMapper<
  Performance,
  typeof TRANSFORM_CONFIGS.performance
>(TRANSFORM_CONFIGS.performance);
```

### 타입 안전성

Mapper는 TypeScript의 타입 시스템을 활용하여 다음을 보장합니다:

- 변환 설정에 없는 필드는 원본 그대로 유지
- 변환된 필드는 정확한 타입으로 추론
- 컴파일 타임에 타입 오류 검출

## 3. Hook Factory (`apps/web/hooks/useCustomQuery.ts`)

### 역할

재사용 가능한 React Query 훅을 생성하는 팩토리 함수들을 제공합니다.

### createQueryHook

데이터 조회(GET)를 위한 훅을 생성합니다.

```typescript
export function createQueryHook<
  TApiFn extends (...args: any[]) => any,
  TArgs extends unknown[],
  TMappedData = ApiSuccessType<TApiFn>,
>(
  apiFn: TApiFn,
  getQueryKey: (...args: TArgs) => QueryKey,
  mapper?: (data: ApiSuccessType<TApiFn>) => TMappedData,
);
```

**매개변수:**

- `apiFn`: API 클라이언트 메서드 (예: `ApiClient.prototype.getPerformanceById`)
- `getQueryKey`: 쿼리 키 생성 함수 (React Query 캐싱에 사용)
- `mapper`: 선택적 데이터 변환 함수

**사용 예시:**

```typescript
export const usePerformance = createQueryHook(
  ApiClient.prototype.getPerformanceById,
  (performanceId: number) => ["performance", performanceId],
  mapPerformance, // Date 변환을 위한 mapper
);
```

### createMutationHook

데이터 변경(POST, PUT, PATCH, DELETE)을 위한 훅을 생성합니다.

```typescript
export function createMutationHook<
  TApiFn extends (...args: any[]) => any,
  TMappedData = ApiSuccessType<TApiFn>,
>(apiFn: TApiFn, mapper?: (data: ApiSuccessType<TApiFn>) => TMappedData);
```

**사용 예시:**

```typescript
export const useCreatePerformance = createMutationHook(
  ApiClient.prototype.createPerformance,
  mapPerformance,
);
```

### 타입 자동 추론

Hook Factory는 다음을 자동으로 추론합니다:

- **성공 응답 타입**: API 메서드의 반환 타입에서 추출
- **에러 타입**: API 메서드의 `@throws` JSDoc에서 추출
- **매개변수 타입**: API 메서드의 매개변수에서 추출

## 4. Custom Hooks (`apps/web/hooks/api/`)

### 역할

각 도메인별로 특화된 React Query 훅을 제공합니다.

### 파일 구조

```
apps/web/hooks/api/
├── mapper.ts              # 데이터 변환 함수
├── usePerformance.ts      # 공연 관련 훅
├── useTeam.ts             # 팀 관련 훅
├── useSession.ts          # 세션 관련 훅
├── useUser.ts             # 유저 관련 훅
└── useGeneration.ts       # 기수 관련 훅
```

### 표준 패턴

각 도메인별 훅 파일은 일관된 패턴을 따릅니다:

```typescript
// 1. Import
import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery";
import ApiClient from "@repo/api-client";
import { mapEntity, mapEntities } from "./mapper"; // 필요시

// 2. Create 훅
export const useCreateEntity = createMutationHook(
  ApiClient.prototype.createEntity,
  mapEntity, // mapper 적용
);

// 3. List 훅
export const useEntities = createQueryHook(
  ApiClient.prototype.getEntities,
  () => ["entities"],
  mapEntities, // 배열 mapper 적용
);

// 4. Get 훅
export const useEntity = createQueryHook(
  ApiClient.prototype.getEntityById,
  (entityId: number) => ["entity", entityId],
  mapEntity,
);

// 5. Update 훅
export const useUpdateEntity = createMutationHook(
  ApiClient.prototype.updateEntity,
  mapEntity,
);

// 6. Delete 훅
export const useDeleteEntity = createMutationHook(
  ApiClient.prototype.deleteEntity,
  mapEntity,
);
```

### Mapper 적용 규칙

**Mapper를 적용해야 하는 경우:**

- 엔티티에 `Date` 타입 필드가 있는 경우 (예: `createdAt`, `updatedAt`)
- JSON 직렬화로 인해 타입이 변경된 필드가 있는 경우

**Mapper를 적용하지 않아도 되는 경우:**

- 모든 필드가 원시 타입(string, number, boolean)인 경우
- 중첩 객체가 없고 변환이 필요 없는 경우

## 5. UI Components (React Components)

### 역할

사용자 인터페이스를 렌더링하고 커스텀 훅을 통해 데이터를 사용합니다.

### 사용 패턴

#### Query Hook 사용 (데이터 조회)

```typescript
const TeamDetail = (props: TeamDetailProps) => {
  const id = props.params.teamId

  // 훅 호출
  const { data: team, isLoading, isError } = useTeam(id)

  // 로딩 상태 처리
  if (isLoading) return <Loading />

  // 에러 상태 처리
  if (isError) return <div>Error</div>

  // 데이터 없음 처리
  if (!team) return <NotFoundPage />

  // 정상 렌더링 - team.createdAt는 Date 객체
  return (
    <div>
      <h1>{team.name}</h1>
      <p>생성일: {team.createdAt.toLocaleDateString()}</p>
    </div>
  )
}
```

#### Mutation Hook 사용 (데이터 변경)

```typescript
const PerformanceForm = () => {
  const { mutate: createPerformance, isPending } = useCreatePerformance()

  const handleSubmit = (data: CreatePerformance) => {
    createPerformance(data, {
      onSuccess: (performance) => {
        // 성공 처리 - performance.createdAt는 Date 객체
        console.log('생성됨:', performance.createdAt)
      },
      onError: (error) => {
        // 에러 처리 - 타입 안전한 에러 객체
        if (error instanceof ValidationError) {
          console.error('유효성 검사 실패')
        }
      }
    })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

## 데이터 흐름

### 조회(Query) 흐름

```
1. UI Component에서 커스텀 훅 호출
   usePerformance(id)

2. Hook Factory에서 React Query 훅 생성
   - Query Key: ["performance", id]
   - Query Function 실행

3. API Client 메서드 호출
   apiClient.getPerformanceById(id)

4. HTTP GET 요청
   GET /performances/:id

5. 서버 응답
   { isSuccess: true, data: { id: 1, createdAt: "2024-01-01T00:00:00.000Z", ... } }

6. Mapper 함수 적용
   mapPerformance(rawData)
   → { id: 1, createdAt: Date, ... }

7. React Query 캐싱 및 상태 관리

8. UI Component 렌더링
   performance.createdAt.toLocaleDateString()
```

### 변경(Mutation) 흐름

```
1. UI Component에서 mutation 트리거
   createPerformance(data)

2. Hook Factory에서 React Query mutation 실행

3. API Client 메서드 호출
   apiClient.createPerformance(data)

4. HTTP POST 요청
   POST /performances
   Body: { name: "...", startAt: Date, ... }

5. 서버 응답
   { isSuccess: true, data: { id: 1, createdAt: "2024-01-01T00:00:00.000Z", ... } }

6. Mapper 함수 적용
   mapPerformance(rawData)

7. onSuccess 콜백 실행
   - Query 무효화 (자동 리페치)
   - UI 업데이트
```

## 에러 처리

### 타입 안전한 에러 처리

API Client의 JSDoc `@throws` 태그를 통해 발생 가능한 에러를 명시하고,
TypeScript는 이를 활용하여 에러 타입을 추론합니다.

```typescript
// API Client에서 에러 타입 정의
/**
 * @throws {ValidationError} 입력값이 올바르지 않은 경우
 * @throws {AuthError} 로그인 하지 않은 경우
 * @throws {NotFoundError} 리소스가 존재하지 않는 경우
 */
public getPerformanceById(id: number) {
  return this._request<
    PerformanceDetail,
    ValidationError | AuthError | NotFoundError | InternalServerError
  >(`/performances/${id}`, "GET")
}

// Component에서 타입 안전한 에러 처리
const { data, error } = usePerformance(id)

if (error) {
  if (error instanceof ValidationError) {
    // 유효성 검사 에러
  } else if (error instanceof AuthError) {
    // 인증 에러
  } else if (error instanceof NotFoundError) {
    // 404 에러
  }
}
```

## 장점

### 1. 타입 안전성

- 컴파일 타임에 API 계약 검증
- 자동 완성 및 IntelliSense 지원
- 리팩토링 안정성

### 2. 개발자 경험

- JSDoc을 통한 명확한 API 문서
- 일관된 에러 처리 패턴
- 재사용 가능한 훅 패턴

### 3. 유지보수성

- 중앙 집중식 API 관리
- 타입 변경 시 자동 감지
- 명확한 책임 분리

### 4. 성능

- React Query의 강력한 캐싱
- 자동 리페치 및 백그라운드 업데이트
- 낙관적 업데이트 지원

## 새로운 API 추가 방법

### 1. Shared Types 정의 (`@repo/shared-types`)

```typescript
export interface NewEntity {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNewEntity {
  name: string;
}
```

### 2. API Client 메서드 추가 (`@repo/api-client`)

```typescript
/**
 * 새 엔티티 생성
 * @throws {ValidationError} 입력값이 올바르지 않은 경우
 * @throws {AuthError} 로그인 하지 않은 경우
 */
public createNewEntity(data: CreateNewEntity) {
  return this._request<
    NewEntity,
    ValidationError | AuthError | InternalServerError
  >(`/new-entities`, "POST", data)
}
```

### 3. Mapper 설정 추가 (필요시)

```typescript
// mapper.ts에 추가
export const TRANSFORM_CONFIGS = {
  // ... 기존 설정
  newEntity: {
    createdAt: FIELD_TRANSFORMERS.toDate,
    updatedAt: FIELD_TRANSFORMERS.toDate,
  },
};

export const mapNewEntity = createConfigBasedMapper<
  NewEntity,
  typeof TRANSFORM_CONFIGS.newEntity
>(TRANSFORM_CONFIGS.newEntity);
```

### 4. Custom Hook 생성

```typescript
// useNewEntity.ts
import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery";
import ApiClient from "@repo/api-client";
import { mapNewEntity } from "./mapper";

export const useCreateNewEntity = createMutationHook(
  ApiClient.prototype.createNewEntity,
  mapNewEntity,
);

export const useNewEntity = createQueryHook(
  ApiClient.prototype.getNewEntityById,
  (id: number) => ["newEntity", id],
  mapNewEntity,
);
```

### 5. Component에서 사용

```typescript
const MyComponent = () => {
  const { data: entity } = useNewEntity(1)
  const { mutate: createEntity } = useCreateNewEntity()

  // entity.createdAt는 Date 객체
  return <div>{entity?.createdAt.toLocaleDateString()}</div>
}
```

## 참고 자료

- [React Query 공식 문서](https://tanstack.com/query/latest)
- [TypeScript 공식 문서](https://www.typescriptlang.org/)
- [Next.js 공식 문서](https://nextjs.org/)
