# PoC Report — Spec-First API Codegen (Performance Domain)

> Date: 2026-05-05
> Issue: [#489](https://github.com/skku-amang/main/issues/489)
> Branch: `feat/api-spec-poc-performance`

## 합격 기준 검증

| 기준                                             | 결과                                                                                               |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| ApiClient Performance 사용 0건                   | ✅ Performance 관련 endpoint 전부 spec-derived로 이전, legacy ApiClient는 다른 도메인용으로만 잔존 |
| 손코딩 ApiClient method 0개 (Performance 도메인) | ✅ generated SDK 함수만 사용                                                                       |
| Repo-wide `pnpm check-types` 통과                | ✅ 8/8 packages green                                                                              |
| `pnpm --filter=api build` 통과                   | ✅                                                                                                 |
| Discriminated union TS narrowing                 | ✅ const literal `type` URI로 자동 narrowing 작동 (이슈 #489 위험 4번 해소)                        |

## 새로 발견된 PoC 인사이트

이슈 #489 본문에 반영해야 할 내용:

### 1. nestjs-zod 폐기는 과도한 결정이었다 — 유지하되 schema source만 변경

당초 "nestjs-zod 폐기, BE도 spec에서 derive"로 결정했으나, 실제 마이그레이션 시 더 정밀한 답을 발견:

- `nestjs-zod`의 `createZodDto` + `ZodValidationPipe`는 **lightweight Zod ↔ NestJS adapter** 역할.
- 폐기 대상은 nestjs-zod 자체가 아니라 **hand-written Zod schema** (`@repo/shared-types`).
- spec에서 derive된 Zod schema (`zPerformanceCreate` 등)를 `createZodDto`에 그대로 넣어도 됨 → BE 코드 변경 최소.

**구체적 변화**:

```ts
// Before
import { CreatePerformanceApiSchema } from "@repo/shared-types";
export class CreatePerformanceDto extends createZodDto(
  CreatePerformanceApiSchema,
) {}

// After
import { zPerformanceCreate } from "@repo/api-client";
export class CreatePerformanceDto extends createZodDto(zPerformanceCreate) {}
```

이 발견의 함의: 이슈 본문의 마이그레이션 비용이 과대평가됨. 9개 도메인 BE 전환이 controller 재작성이 아니라 schema import 한 줄 변경 수준.

### 2. Hey API discriminator 키워드 함정

`oneOf` + explicit `discriminator: { propertyName: type }` 사용 시 Hey API가 schema 이름을 mapping value로 해석 → const URI와 intersection이 `never`. 해결:

- `discriminator` 키워드 제거하고 oneOf만 사용
- 각 variant의 `type: { type: string, const: "..." }` 필드가 자연스럽게 TS discriminated union 형성
- `error.type === "/errors/validation-error"` 식의 narrowing이 정상 작동

**spec 작성 가이드라인에 추가 필요**.

### 3. Spec은 logical contract — wire envelope 노출 안 함

기존 BE는 모든 응답을 `{isSuccess, isFailure, data|error}` 봉투로 wrap. spec에 봉투를 선언하면 generated 타입이 호출부를 verbose하게 만듦 (`response.data.data`).

**채택한 패턴**: spec은 봉투 미선언 (logical contract만 기술), FE 인터셉터(`spec-client.ts`)가 응답에서 봉투를 strip → SDK 함수가 반환하는 data == spec의 응답 타입.

**트레이드오프**: 외부 도구(Postman, Stoplight)가 wire envelope을 못 봄. PoC는 수용. Phase 3에서 BE의 `ApiResultInterceptor` 자체를 제거해 wire ↔ logical 일치시키는 것이 cleaner — 별도 이슈로 분리 권장.

### 4. OpenAPI 3.1 vs 3.0 syntax — `nullable: true` 폐기됨

`openapi: 3.1.0` 선언 시 `nullable: true` 사용 불가 (JSON Schema 2020-12 정렬). 대신 `type: [string, "null"]` 배열 형식 사용.

### 5. Hey API runtime config 경로

`runtimeConfigPath`는 **출력 디렉터리 기준 상대경로**. `src/generated/`가 출력이고 mutator가 `src/client.ts`라면 `runtimeConfigPath: "../client"` (output 기준 한 단계 위).

### 6. 환경별 module resolution 호환

api-client의 `package.json exports` 필드를 활용하려면 consumer의 `moduleResolution`이 `bundler`/`node16`/`nodenext` 중 하나여야 함. apps/api는 legacy `node` 사용 → `exports` 서브경로 안 보임. 해결: main `src/index.ts`에서 generated 자산을 **re-export** (named + namespace 양쪽).

```ts
// packages/api-client/src/index.ts
export * as ApiSdk from "./generated/sdk.gen";
export * as ApiSchemas from "./generated/zod.gen";
export * as ApiQueries from "./generated/@tanstack/react-query.gen";
export type * as ApiTypes from "./generated/types.gen";
export { zPerformanceCreate, zPerformanceUpdate } from "./generated/zod.gen";
```

### 7. Date 변환은 `mapper.ts` 없이 가능

기존 코드의 `mapper.ts`는 string → Date 변환을 위한 보일러플레이트. spec-derived 타입은 `string`(ISO date-time) 그대로 노출하고, 호출부에서 `new Date(...)` 변환. 컴포넌트는 이미 그렇게 사용 중이라 자연스러움.

## 산출물 구조

```
packages/api-client/
├── spec/
│   ├── openapi.yaml          (루트 — paths $ref + tags + securitySchemes)
│   ├── _shared.yaml          (cross-cutting Problem schemas + 표준 responses)
│   └── v1/
│       └── performance.yaml  (Performance 도메인 self-contained)
├── src/
│   ├── client.ts             (Hey API config + 토큰 state)
│   ├── spec-client.ts        (response interceptor: envelope unwrap + ProblemDocument → typed error)
│   ├── problem-mapper.ts     (RFC 7807 type URI → ApiError 인스턴스)
│   ├── errors.ts             (기존 — 변경 없음)
│   ├── index.ts              (기존 ApiClient + 새 generated re-exports)
│   └── generated/            (Hey API 출력)
│       ├── client.gen.ts
│       ├── sdk.gen.ts        (5개 endpoint fetcher)
│       ├── types.gen.ts
│       ├── zod.gen.ts        (Zod schemas — BE validation, FE 폼 검증 양쪽 source)
│       └── @tanstack/
│           └── react-query.gen.ts (queryOptions/mutationOptions)
├── openapi-ts.config.ts
├── redocly.yaml
└── package.json
```

## 수치

| 항목                                                            | 측정                                                            |
| --------------------------------------------------------------- | --------------------------------------------------------------- |
| spec 손작성 (performance.yaml + \_shared.yaml + openapi.yaml)   | ~600줄                                                          |
| generated 코드                                                  | ~1,300줄                                                        |
| 손코딩 mutator (client.ts + spec-client.ts + problem-mapper.ts) | ~200줄                                                          |
| 폐기된 손코딩 ApiClient 메서드 (Performance 부분)               | 5개 (~150줄 추정)                                               |
| FE 호출부 변경                                                  | 6개 파일 (대부분 import만 바뀜, signature 호환 유지)            |
| BE 변경                                                         | DTO 2개 + service 1개 (`InvalidPerformanceDateError` 검증 추가) |

## Phase 2 (8개 도메인 일괄 전환)에 적용할 패턴

PoC에서 검증된 워크플로:

1. `spec/v1/{domain}.yaml` 작성
   - 도메인-specific Problem schemas (`InvalidPerformanceDateProblem`처럼)
   - paths + responses (envelope 미선언, `_shared.yaml`의 표준 responses 재사용)
2. `pnpm generate` 실행 → 자동 reflect
3. BE DTO `createZodDto(zXxxCreate)`로 변경 (1줄 import 변경)
4. 서비스 레이어에 cross-field 검증 추가 (Zod refine 폐기 분량)
5. FE hooks (`apps/web/hooks/api/useXxx.ts`)을 generated queryOptions wrapper로 교체
6. RSC fetch는 `ApiSdk.xxx({ throwOnError: true })`로 직접 호출

## 남은 검증 (런타임)

이 PoC 보고서는 **컴파일타임 검증**까지만 다룸. 런타임 smoke test는 별도 단계:

- [ ] 로컬 DB/MinIO/auth 인프라 기동
- [ ] `pnpm dev` (web + api) 동시 기동 후 Performance 페이지 진입
- [ ] Playwright walkthrough: 목록 / 상세 / 생성 / 수정 / 삭제
- [ ] 401 + refresh 시나리오 (토큰 만료 트리거)
- [ ] Discriminated error narrowing (e.g., `InvalidPerformanceDateError` 분기)

## 권고사항

1. **이슈 #489 본문 업데이트**: 위 6가지 인사이트 반영 (특히 nestjs-zod 폐기 → schema source 변경으로 정정).
2. **Phase 2 일괄 전환을 단일 PR로 묶지 말 것**: 도메인별 PR 분리. 도메인 간 cross-domain $ref 정리(예: Team이 PerformanceId 참조)는 일찍 표면화시킴.
3. **Phase 3에서 BE `ApiResultInterceptor` 제거 검토**: spec과 wire format 일치시키면 외부 도구 호환성 회복. 별도 이슈로.
4. **`@repo/shared-types` 사용 흔적 점진 제거**: 도메인별 마이그레이션 시 자연스럽게 spec-derived로 전환됨.
