# DOC-009: 에러 처리 및 응답 표준

> AI 재구성을 위한 상세 명세

---

## 1. 개요

AMANG 프로젝트는 **RFC 7807 Problem Details** 표준을 기반으로 일관된 에러 응답 형식을 사용합니다. 모든 API 응답은 성공/실패 여부를 명확히 구분하는 래퍼 구조를 사용합니다.

---

## 2. API 응답 래퍼 구조

### 2.1 타입 정의

**파일 경로**: `packages/api-client/src/api-result.ts`

```typescript
import { ProblemDocument } from "./errors";

export type Success<T> = {
  isSuccess: true;
  isFailure: false;
  data: T;
};

export type Failure = {
  isSuccess: false;
  isFailure: true;
  error: ProblemDocument;
};

export type ApiResult<T> = Success<T> | Failure;
```

### 2.2 성공 응답 예시

```json
{
  "isSuccess": true,
  "isFailure": false,
  "data": {
    "id": 1,
    "name": "2024 정기공연",
    "startDatetime": "2024-12-01T18:00:00.000Z",
    "endDatetime": "2024-12-01T21:00:00.000Z"
  }
}
```

### 2.3 실패 응답 예시

```json
{
  "isSuccess": false,
  "isFailure": true,
  "error": {
    "type": "/errors/not-found",
    "status": 404,
    "title": "Not Found",
    "detail": "ID가 999인 팀을 찾을 수 없습니다.",
    "instance": "/api/teams/999"
  }
}
```

---

## 3. RFC 7807 Problem Details 형식

### 3.1 ProblemDocument 타입

**파일 경로**: `packages/api-client/src/errors.ts`

```typescript
/**
 * RFC 7807 표준을 따르는 에러 데이터 객체 타입
 * JSON으로 직렬화되어 클라이언트에 전달되는 실제 데이터의 형태입니다.
 */
export type ProblemDocument = {
  type: string; // 에러 유형 식별자 (URI 형식)
  title: string; // 사람이 읽을 수 있는 짧은 제목
  status: number; // HTTP 상태 코드
  detail?: string; // 에러에 대한 상세 설명
  instance?: string; // 문제가 발생한 특정 리소스 경로
};
```

### 3.2 필드 설명

| 필드       | 필수 | 설명                                                       |
| ---------- | ---- | ---------------------------------------------------------- |
| `type`     | ✅   | 에러 유형을 고유하게 식별하는 URI. 예: `/errors/not-found` |
| `title`    | ✅   | HTTP 상태에 해당하는 간결한 제목. 예: "Not Found"          |
| `status`   | ✅   | HTTP 상태 코드. 예: 404                                    |
| `detail`   | ❌   | 해당 에러 발생에 대한 구체적 설명                          |
| `instance` | ❌   | 요청된 URL 경로. 자동으로 채워짐                           |

---

## 4. 에러 클래스 계층 구조

### 4.1 기본 추상 클래스

```typescript
export abstract class ApiError extends Error {
  abstract readonly type: string;
  abstract readonly status: number;
  abstract readonly title: string;

  constructor(
    message: string,
    public readonly detail?: string,
    public readonly instance?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
```

### 4.2 공통 에러 클래스

| 클래스명                   | type                            | status | title                 | 사용 상황        |
| -------------------------- | ------------------------------- | ------ | --------------------- | ---------------- |
| `NotFoundError`            | `/errors/not-found`             | 404    | Not Found             | 리소스 조회 실패 |
| `ValidationError`          | `/errors/validation-error`      | 400    | Validation Error      | 입력값 검증 실패 |
| `AuthError`                | `/errors/authentication-error`  | 401    | Authentication Error  | 인증 필요        |
| `ForbiddenError`           | `/errors/forbidden`             | 403    | Forbidden             | 권한 없음        |
| `ConflictError`            | `/errors/conflict`              | 409    | Conflict              | 데이터 충돌      |
| `UnprocessableEntityError` | `/errors/unprocessable-entity`  | 422    | Unprocessable Entity  | 처리 불가 요청   |
| `InternalServerError`      | `/errors/internal-server-error` | 500    | Internal Server Error | 서버 내부 오류   |

### 4.3 도메인 특화 에러 클래스

#### Team 도메인 에러

| 클래스명                        | type                                       | status | 사용 상황                      |
| ------------------------------- | ------------------------------------------ | ------ | ------------------------------ |
| `DuplicateApplicationError`     | `/errors/team/duplicate-application`       | 409    | 동일 세션 중복 지원            |
| `PositionOccupiedError`         | `/errors/team/position-occupied`           | 409    | 인덱스 선점됨 (Race Condition) |
| `SessionNotFoundError`          | `/errors/team/session-not-found`           | 404    | 팀 내 세션 미존재              |
| `NoApplicationFoundError`       | `/errors/team/no-application-found`        | 404    | 취소할 지원 없음               |
| `InvalidMemberIndexError`       | `/errors/team/invalid-member-index`        | 400    | 인덱스 범위 초과               |
| `DuplicateMemberIndexError`     | `/errors/team/duplicate-member-index`      | 400    | 세션 내 인덱스 중복            |
| `DuplicateSessionUserError`     | `/errors/team/duplicate-session-user`      | 400    | 세션 내 사용자 중복            |
| `DuplicateTeamSessionError`     | `/errors/team/duplicate-team-session`      | 422    | 팀 내 세션 중복                |
| `ReferencedEntityNotFoundError` | `/errors/team/referenced-entity-not-found` | 422    | 참조 엔티티 미존재             |

#### Performance 도메인 에러

| 클래스명                      | type                                           | status | 사용 상황       |
| ----------------------------- | ---------------------------------------------- | ------ | --------------- |
| `InvalidPerformanceDateError` | `/errors/performance/invalid-performance-date` | 400    | 시작일 > 종료일 |

#### Token 도메인 에러

| 클래스명                    | type                                    | status | 사용 상황          |
| --------------------------- | --------------------------------------- | ------ | ------------------ |
| `AccessTokenExpiredError`   | `/errors/token/access-token-expired`    | 401    | 액세스 토큰 만료   |
| `RefreshTokenExpiredError`  | `/errors/token/refresh-token-expired`   | 401    | 리프레시 토큰 만료 |
| `AccessTokenNotFoundError`  | `/errors/token/access-token-not-found`  | 401    | 액세스 토큰 누락   |
| `RefreshTokenNotFoundError` | `/errors/token/refresh-token-not-found` | 401    | 리프레시 토큰 누락 |

---

## 5. 에러 클래스 전체 구현

**파일 경로**: `packages/api-client/src/errors.ts`

```typescript
/**
 * RFC 7807 표준을 따르는 에러 데이터 객체 타입
 */
export type ProblemDocument = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
};

export abstract class ApiError extends Error {
  abstract readonly type: string;
  abstract readonly status: number;
  abstract readonly title: string;

  constructor(
    message: string,
    public readonly detail?: string,
    public readonly instance?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// ----------------------------------
// Common Errors
// ----------------------------------

export class NotFoundError extends ApiError {
  readonly type = "/errors/not-found";
  readonly status = 404;
  readonly title = "Not Found";

  constructor(detail?: string, instance?: string) {
    super("요청하신 리소스를 찾을 수 없습니다", detail, instance);
  }
}

export class InternalServerError extends ApiError {
  readonly type = "/errors/internal-server-error";
  readonly status = 500;
  readonly title = "Internal Server Error";

  constructor(detail?: string, instance?: string) {
    super("서버에서 오류가 발생했습니다", detail, instance);
  }
}

export class ValidationError extends ApiError {
  readonly type = "/errors/validation-error";
  readonly status = 400;
  readonly title = "Validation Error";

  constructor(detail?: string, instance?: string) {
    super("입력값이 올바르지 않습니다", detail, instance);
  }
}

export class AuthError extends ApiError {
  readonly type = "/errors/authentication-error";
  readonly status = 401;
  readonly title = "Authentication Error";

  constructor(detail?: string, instance?: string) {
    super("유효한 인증 정보가 필요합니다.", detail, instance);
  }
}

export class ForbiddenError extends ApiError {
  readonly type = "/errors/forbidden";
  readonly status = 403;
  readonly title = "Forbidden";

  constructor(detail?: string, instance?: string) {
    super("접근 권한이 없습니다", detail, instance);
  }
}

export class ConflictError extends ApiError {
  readonly type = "/errors/conflict";
  readonly status = 409;
  readonly title = "Conflict";

  constructor(detail?: string, instance?: string) {
    super("이미 존재하는 데이터입니다", detail, instance);
  }
}

export class UnprocessableEntityError extends ApiError {
  readonly type = "/errors/unprocessable-entity";
  readonly status = 422;
  readonly title = "Unprocessable Entity";

  constructor(detail?: string, instance?: string) {
    super("처리할 수 없는 엔티티입니다", detail, instance);
  }
}

// ----------------------------------
// Team Specific Errors
// ----------------------------------

export class DuplicateApplicationError extends ApiError {
  readonly type = "/errors/team/duplicate-application";
  readonly status = 409;
  readonly title = "Conflict";

  constructor(detail?: string, instance?: string) {
    super("이미 해당 세션에 지원한 이력이 있습니다.", detail, instance);
  }
}

export class PositionOccupiedError extends ApiError {
  readonly type = "/errors/team/position-occupied";
  readonly status = 409;
  readonly title = "Conflict";

  constructor(detail?: string, instance?: string) {
    super("해당 포지션은 이미 다른 사용자가 지원했습니다.", detail, instance);
  }
}

export class SessionNotFoundError extends ApiError {
  readonly type = "/errors/team/session-not-found";
  readonly status = 404;
  readonly title = "Not Found";

  constructor(detail?: string, instance?: string) {
    super("해당 세션이 팀에 존재하지 않습니다.", detail, instance);
  }
}

export class NoApplicationFoundError extends ApiError {
  readonly type = "/errors/team/no-application-found";
  readonly status = 404;
  readonly title = "Not Found";

  constructor(detail?: string, instance?: string) {
    super("취소할 지원 기록을 찾을 수 없습니다.", detail, instance);
  }
}

export class InvalidMemberIndexError extends ApiError {
  readonly type = "/errors/team/invalid-member-index";
  readonly status = 400;
  readonly title = "Validation Error";

  constructor(detail?: string, instance?: string) {
    super("멤버 인덱스가 유효 범위를 벗어났습니다.", detail, instance);
  }
}

export class DuplicateMemberIndexError extends ApiError {
  readonly type = "/errors/team/duplicate-member-index";
  readonly status = 400;
  readonly title = "Validation Error";

  constructor(detail?: string, instance?: string) {
    super("세션 내에 중복된 멤버 인덱스가 존재합니다.", detail, instance);
  }
}

export class DuplicateSessionUserError extends ApiError {
  readonly type = "/errors/team/duplicate-session-user";
  readonly status = 400;
  readonly title = "Validation Error";

  constructor(detail?: string, instance?: string) {
    super("세션 내에 중복된 사용자가 존재합니다.", detail, instance);
  }
}

export class DuplicateTeamSessionError extends ApiError {
  readonly type = "/errors/team/duplicate-team-session";
  readonly status = 422;
  readonly title = "Unprocessable Entity";

  constructor(detail?: string, instance?: string) {
    super(
      "한 팀에 동일한 세션을 중복하여 추가할 수 없습니다.",
      detail,
      instance,
    );
  }
}

export class ReferencedEntityNotFoundError extends ApiError {
  readonly type = "/errors/team/referenced-entity-not-found";
  readonly status = 422;
  readonly title = "Unprocessable Entity";

  constructor(detail?: string, instance?: string) {
    super(
      "존재하지 않는 리소스(리더, 세션, 사용자 등)를 참조하고 있습니다.",
      detail,
      instance,
    );
  }
}

// ----------------------------------
// Performance Specific Errors
// ----------------------------------

export class InvalidPerformanceDateError extends ApiError {
  readonly type = "/errors/performance/invalid-performance-date";
  readonly status = 400;
  readonly title = "Validation Error";

  constructor(detail?: string, instance?: string) {
    super(
      "공연의 시작 일시는 종료 일시보다 이전이어야 합니다.",
      detail,
      instance,
    );
  }
}

// ----------------------------------
// Token Specific Errors
// ----------------------------------

export class RefreshTokenExpiredError extends ApiError {
  readonly type = "/errors/token/refresh-token-expired";
  readonly status = 401;
  readonly title = "Refresh Token Expired";

  constructor(detail?: string, instance?: string) {
    super("리프레시 토큰이 만료되었습니다.", detail, instance);
  }
}

export class AccessTokenExpiredError extends ApiError {
  readonly type = "/errors/token/access-token-expired";
  readonly status = 401;
  readonly title = "Access Token Expired";

  constructor(detail?: string, instance?: string) {
    super("액세스 토큰이 만료되었습니다.", detail, instance);
  }
}

export class RefreshTokenNotFoundError extends ApiError {
  readonly type = "/errors/token/refresh-token-not-found";
  readonly status = 401;
  readonly title = "Refresh Token Not Found";

  constructor(detail?: string, instance?: string) {
    super("리프레시 토큰이 존재하지 않습니다.", detail, instance);
  }
}

export class AccessTokenNotFoundError extends ApiError {
  readonly type = "/errors/token/access-token-not-found";
  readonly status = 401;
  readonly title = "Access Token Not Found";

  constructor(detail?: string, instance?: string) {
    super("액세스 토큰이 존재하지 않습니다.", detail, instance);
  }
}
```

---

## 6. 서버 측 에러 처리 (NestJS)

### 6.1 Exception Filter 체계

NestJS에서 3개의 Exception Filter를 사용하여 에러를 일관되게 처리합니다.

```
┌─────────────────────────────────────────────────────────────┐
│                        요청 처리                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                      예외 발생 시
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ ZodValidation   │ │   ApiError      │ │   AllError      │
│ ErrorFilter     │ │   Filter        │ │   Filter        │
│ (최우선)         │ │ (중간 우선순위)   │ │ (최후 폴백)      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
    ValidationError      ApiError 서브클래스   InternalServerError
```

### 6.2 ZodValidationErrorFilter

**파일 경로**: `apps/api/src/common/filters/zod-validation-error.ts`

```typescript
import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { ValidationError, Failure } from "@repo/api-client";
import { ZodValidationException } from "nestjs-zod";
import { fromZodError } from "zod-validation-error/v3";

@Catch(ZodValidationException)
export class ZodValidationErrorFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: ZodValidationException, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const predefinedError = new ValidationError();
    const zodError = exception.getZodError();
    const validationError = fromZodError(zodError, { prefix: null });

    const responseBody = {
      isSuccess: false,
      isFailure: true,
      error: {
        type: predefinedError.type,
        status: predefinedError.status,
        title: predefinedError.title,
        detail: validationError.message,
        instance: request.url,
      },
    } satisfies Failure;

    httpAdapter.reply(ctx.getResponse(), responseBody, predefinedError.status);
  }
}
```

### 6.3 ApiErrorFilter

**파일 경로**: `apps/api/src/common/filters/api-error.filter.ts`

```typescript
import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { ApiError, Failure } from "@repo/api-client";

@Catch(ApiError)
export class ApiErrorFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: ApiError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const responseBody = {
      isSuccess: false,
      isFailure: true,
      error: {
        type: exception.type,
        status: exception.status,
        title: exception.title,
        detail: exception.detail,
        instance: request.url,
      },
    } satisfies Failure;

    httpAdapter.reply(ctx.getResponse(), responseBody, exception.status);
  }
}
```

### 6.4 AllErrorFilter (폴백)

**파일 경로**: `apps/api/src/common/filters/all-error.filter.ts`

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { Failure, InternalServerError } from "@repo/api-client";

@Catch()
export class AllErrorFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    // 로깅 (추후 Logger 서비스로 교체)
    console.error("Unhandled Error:", JSON.stringify(exception, null, 2));

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const detail =
      exception instanceof HttpException
        ? (exception.getResponse() as any)?.message || exception.message
        : (exception as any)?.message ||
          "서버에서 처리되지 않은 오류가 발생했습니다.";

    const internalServerError = new InternalServerError();

    const responseBody = {
      isSuccess: false,
      isFailure: true,
      error: {
        type: internalServerError.type,
        status: httpStatus,
        title: internalServerError.title,
        detail,
        instance: request.url,
      },
    } satisfies Failure;

    httpAdapter.reply(
      ctx.getResponse(),
      responseBody,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
```

### 6.5 Filter 등록

**파일 경로**: `apps/api/src/main.ts`

```typescript
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ZodValidationErrorFilter } from "./common/filters/zod-validation-error";
import { ApiErrorFilter } from "./common/filters/api-error.filter";
import { AllErrorFilter } from "./common/filters/all-error.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const httpAdapter = app.get(HttpAdapterHost);

  // 필터 등록 순서: 가장 나중에 등록된 것이 먼저 체크됨
  // 따라서 AllErrorFilter → ApiErrorFilter → ZodValidationErrorFilter 순으로 등록
  app.useGlobalFilters(
    new AllErrorFilter(httpAdapter),
    new ApiErrorFilter(httpAdapter),
    new ZodValidationErrorFilter(httpAdapter),
  );

  await app.listen(8000);
}
bootstrap();
```

---

## 7. Prisma 에러 변환 패턴

### 7.1 주요 Prisma 에러 코드

| 코드    | 설명                             | 변환 대상 에러                                   |
| ------- | -------------------------------- | ------------------------------------------------ |
| `P2002` | Unique constraint 위반           | `ConflictError`, 도메인 에러                     |
| `P2003` | Foreign key constraint 위반      | `ReferencedEntityNotFoundError`                  |
| `P2025` | Record not found (update/delete) | `NotFoundError`, `ReferencedEntityNotFoundError` |

### 7.2 변환 패턴 예시 (TeamService)

```typescript
import { Prisma } from "@repo/database"
import {
  ConflictError,
  DuplicateTeamSessionError,
  ReferencedEntityNotFoundError,
  DuplicateApplicationError,
  PositionOccupiedError
} from "@repo/api-client"

async create(createTeamDto: CreateTeamDto): Promise<Team> {
  try {
    // Prisma 작업 수행
    const team = await this.prisma.team.create({ ... })
    return team
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002":
          // meta.target에서 어떤 필드가 중복인지 확인
          const target = (error.meta?.target as string[]) ?? []

          if (target.includes("teamId") && target.includes("sessionId"))
            throw new DuplicateTeamSessionError(
              "한 팀에 동일한 세션을 중복하여 추가할 수 없습니다."
            )

          throw new ConflictError("이미 존재하는 데이터와 충돌이 발생했습니다.")

        case "P2003":
        case "P2025":
          throw new ReferencedEntityNotFoundError(
            "존재하지 않는 리더, 세션, 공연, 또는 유저를 팀에 추가할 수 없습니다."
          )
      }
    }
    throw error  // 처리되지 않은 에러는 AllErrorFilter로 전달
  }
}
```

### 7.3 Race Condition 처리 (apply 메서드)

```typescript
async apply(id: number, userId: number, applyTeamDto: TeamApplicationDto) {
  // 비즈니스 로직 검증 (낙관적 검증)
  // ...

  try {
    await this.prisma.teamMember.createMany({ data: newMembers })
    return this.findOne(id)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        // Race Condition으로 인한 중복 발생 시
        const target = (error.meta?.target as string[]) ?? []

        if (target.includes("teamSessionId") && target.includes("userId"))
          throw new DuplicateApplicationError(
            "이미 해당 세션에 지원한 이력이 있습니다."
          )

        if (target.includes("teamSessionId") && target.includes("index"))
          throw new PositionOccupiedError(
            "해당 포지션은 방금 다른 사용자가 먼저 지원했습니다."
          )
      }
    }
    throw error
  }
}
```

---

## 8. 클라이언트 측 에러 변환

### 8.1 ProblemDocument → ApiError 변환 함수

**파일 경로**: `packages/api-client/src/index.ts`

```typescript
/**
 * 서버에서 plain object로 전달되는 에러를
 * 자바스크립트의 에러 형식으로 변환합니다.
 */
function createErrorFromProblemDocument(problemDoc: ProblemDocument): ApiError {
  const { detail, instance, type } = problemDoc;

  switch (type) {
    // 공통 에러
    case "/errors/validation-error":
      return new ValidationError(detail, instance);
    case "/errors/authentication-error":
      return new AuthError(detail, instance);
    case "/errors/forbidden":
      return new ForbiddenError(detail, instance);
    case "/errors/not-found":
      return new NotFoundError(detail, instance);
    case "/errors/conflict":
      return new ConflictError(detail, instance);
    case "/errors/unprocessable-entity":
      return new UnprocessableEntityError(detail, instance);
    case "/errors/internal-server-error":
      return new InternalServerError(detail, instance);

    // Team 도메인 에러
    case "/errors/team/duplicate-application":
      return new DuplicateApplicationError(detail, instance);
    case "/errors/team/position-occupied":
      return new PositionOccupiedError(detail, instance);
    case "/errors/team/session-not-found":
      return new SessionNotFoundError(detail, instance);
    case "/errors/team/no-application-found":
      return new NoApplicationFoundError(detail, instance);
    case "/errors/team/invalid-member-index":
      return new InvalidMemberIndexError(detail, instance);
    case "/errors/team/duplicate-member-index":
      return new DuplicateMemberIndexError(detail, instance);
    case "/errors/team/duplicate-session-user":
      return new DuplicateSessionUserError(detail, instance);
    case "/errors/team/duplicate-team-session":
      return new DuplicateTeamSessionError(detail, instance);
    case "/errors/team/referenced-entity-not-found":
      return new ReferencedEntityNotFoundError(detail, instance);

    // Performance 도메인 에러
    case "/errors/performance/invalid-performance-date":
      return new InvalidPerformanceDateError(detail, instance);

    // Token 도메인 에러
    case "/errors/token/refresh-token-expired":
      return new RefreshTokenExpiredError(detail, instance);
    case "/errors/token/access-token-expired":
      return new AccessTokenExpiredError(detail, instance);

    default:
      // 알 수 없는 에러 타입은 InternalServerError로 처리
      return new InternalServerError();
  }
}
```

### 8.2 ApiClient 내 에러 처리 흐름

```typescript
private async _request<T, E extends ProblemDocument>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  body?: any,
  headers?: Record<string, string>
): Promise<PromiseWithError<T, E>> {
  // ... fetch 요청 수행 ...

  const data = (await response.json()) as ApiResult<T>

  if (data.isSuccess) {
    return data.data as T
  }

  // 실패 시 ProblemDocument를 ApiError로 변환 후 throw
  const error = createErrorFromProblemDocument(data.error as ProblemDocument)
  throw error
}
```

---

## 9. 프론트엔드 에러 처리 패턴

### 9.1 TanStack Query 에러 핸들링

```typescript
import { useMutation } from "@tanstack/react-query";
import ApiClient, {
  DuplicateApplicationError,
  PositionOccupiedError,
  ValidationError,
} from "@repo/api-client";

export function useApplyToTeam() {
  return useMutation({
    mutationFn: ({ teamId, application }) =>
      ApiClient.getInstance().applyToTeam(teamId, application),

    onError: (error) => {
      if (error instanceof DuplicateApplicationError) {
        toast.error("이미 해당 세션에 지원하셨습니다.");
      } else if (error instanceof PositionOccupiedError) {
        toast.error("해당 자리는 방금 다른 분이 먼저 지원했습니다.");
      } else if (error instanceof ValidationError) {
        toast.error(error.detail || "입력값을 확인해주세요.");
      } else {
        toast.error("지원 중 오류가 발생했습니다.");
      }
    },
  });
}
```

### 9.2 instanceof를 활용한 타입 가드

```typescript
try {
  await apiClient.createTeam(teamData);
} catch (error) {
  if (error instanceof ReferencedEntityNotFoundError) {
    // 리더, 세션, 사용자 등이 존재하지 않음
  } else if (error instanceof DuplicateTeamSessionError) {
    // 중복된 세션 추가 시도
  } else if (error instanceof ValidationError) {
    // 입력값 검증 실패
  } else {
    // 알 수 없는 에러
    console.error(error);
  }
}
```

---

## 10. 에러 타입 URI 전체 목록

### 10.1 공통 에러

| URI                             | HTTP Status | 설명             |
| ------------------------------- | ----------- | ---------------- |
| `/errors/not-found`             | 404         | 리소스 없음      |
| `/errors/validation-error`      | 400         | 입력값 검증 실패 |
| `/errors/authentication-error`  | 401         | 인증 필요        |
| `/errors/forbidden`             | 403         | 권한 없음        |
| `/errors/conflict`              | 409         | 데이터 충돌      |
| `/errors/unprocessable-entity`  | 422         | 처리 불가 요청   |
| `/errors/internal-server-error` | 500         | 서버 내부 오류   |

### 10.2 Team 도메인

| URI                                        | HTTP Status | 설명                |
| ------------------------------------------ | ----------- | ------------------- |
| `/errors/team/duplicate-application`       | 409         | 동일 세션 중복 지원 |
| `/errors/team/position-occupied`           | 409         | 인덱스 선점됨       |
| `/errors/team/session-not-found`           | 404         | 팀 내 세션 없음     |
| `/errors/team/no-application-found`        | 404         | 취소할 지원 없음    |
| `/errors/team/invalid-member-index`        | 400         | 인덱스 범위 초과    |
| `/errors/team/duplicate-member-index`      | 400         | 인덱스 중복         |
| `/errors/team/duplicate-session-user`      | 400         | 사용자 중복         |
| `/errors/team/duplicate-team-session`      | 422         | 팀 내 세션 중복     |
| `/errors/team/referenced-entity-not-found` | 422         | 참조 엔티티 없음    |

### 10.3 Performance 도메인

| URI                                            | HTTP Status | 설명           |
| ---------------------------------------------- | ----------- | -------------- |
| `/errors/performance/invalid-performance-date` | 400         | 날짜 범위 오류 |

### 10.4 Token 도메인

| URI                                     | HTTP Status | 설명               |
| --------------------------------------- | ----------- | ------------------ |
| `/errors/token/access-token-expired`    | 401         | 액세스 토큰 만료   |
| `/errors/token/refresh-token-expired`   | 401         | 리프레시 토큰 만료 |
| `/errors/token/access-token-not-found`  | 401         | 액세스 토큰 누락   |
| `/errors/token/refresh-token-not-found` | 401         | 리프레시 토큰 누락 |

---

## 11. AI 구현 체크리스트

### 11.1 에러 클래스 추가 시

- [ ] `type` URI는 `/errors/{domain}/{error-name}` 형식 사용
- [ ] `status`는 적절한 HTTP 상태 코드 할당
- [ ] `title`은 HTTP 상태에 해당하는 간결한 영어 제목
- [ ] 생성자의 `message`는 한글 기본 메시지
- [ ] `packages/api-client/src/errors.ts`에 클래스 추가
- [ ] `createErrorFromProblemDocument` 함수에 case 추가
- [ ] export 목록에 추가

### 11.2 서비스에서 에러 발생 시

- [ ] 도메인 에러 클래스 사용 (generic 에러 지양)
- [ ] `detail` 파라미터에 구체적인 컨텍스트 정보 제공
- [ ] Prisma 에러는 catch 블록에서 적절한 에러로 변환
- [ ] 변환되지 않은 에러는 `throw error`로 재던져 AllErrorFilter로 전달

### 11.3 새 도메인 추가 시

- [ ] `/errors/{new-domain}/{error-name}` 형식의 URI 정의
- [ ] 해당 도메인의 모든 에러 케이스 나열
- [ ] errors.ts에 에러 클래스 그룹 추가
- [ ] createErrorFromProblemDocument에 변환 로직 추가

---

## 12. 관련 파일 목록

| 파일 경로                                             | 역할                                |
| ----------------------------------------------------- | ----------------------------------- |
| `packages/api-client/src/errors.ts`                   | 에러 클래스 정의                    |
| `packages/api-client/src/api-result.ts`               | ApiResult 타입 정의                 |
| `packages/api-client/src/index.ts`                    | createErrorFromProblemDocument 함수 |
| `apps/api/src/common/filters/zod-validation-error.ts` | Zod 검증 에러 필터                  |
| `apps/api/src/common/filters/api-error.filter.ts`     | ApiError 필터                       |
| `apps/api/src/common/filters/all-error.filter.ts`     | 폴백 에러 필터                      |
| `apps/api/src/team/team.service.ts`                   | Prisma 에러 변환 예시               |
