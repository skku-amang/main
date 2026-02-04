# DOC-007: API 엔드포인트 명세서

> **문서 버전**: 1.0
> **최종 수정일**: 2026-02-04
> **작성 목적**: AI가 REST API 엔드포인트를 정확하게 구현할 수 있도록 상세 명세

---

## 1. 기본 정보

### 1.1 서버 설정

| 항목                | 값                                |
| ------------------- | --------------------------------- |
| Base URL (개발)     | `http://localhost:8000`           |
| Base URL (프로덕션) | 환경변수 `NEXT_PUBLIC_API_URL`    |
| Content-Type        | `application/json`                |
| 인증 방식           | Bearer Token (Authorization 헤더) |

### 1.2 요청 형식

```http
POST /api/endpoint HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "field": "value"
}
```

### 1.3 응답 형식

**성공 응답**:

```json
{
  "isSuccess": true,
  "data": { ... }
}
```

**실패 응답** (RFC 7807 Problem Details):

```json
{
  "isSuccess": false,
  "error": {
    "type": "/errors/not-found",
    "title": "Not Found",
    "status": 404,
    "detail": "ID가 123인 팀을 찾을 수 없습니다.",
    "instance": "/teams/123"
  }
}
```

---

## 2. 인증 (Auth)

### 2.1 회원가입

```
POST /auth/signup
```

**권한**: Public (인증 불필요)

**Request Body**:

```typescript
{
  email: string;        // 유효한 이메일
  password: string;     // 8자 이상, 영문+숫자+특수문자
  name: string;         // 실명
  nickname: string;     // 닉네임 (중복 불가)
  generationId: number; // 기수 ID
  sessions: number[];   // 세션 ID 배열 (최소 1개)
}
```

**Response** (201 Created):

```typescript
{
  isSuccess: true,
  data: {
    user: {
      id: number;
      email: string;
      name: string;
      nickname: string;
      isAdmin: boolean;
    },
    accessToken: string;
    refreshToken: string;
    expiresIn: number;  // 초 단위
  }
}
```

**Errors**:
| 상태 | 에러 타입 | 설명 |
|------|----------|------|
| 400 | ValidationError | 입력값 검증 실패 |
| 409 | ConflictError | 이메일/닉네임 중복 |
| 422 | UnprocessableEntityError | 존재하지 않는 기수 |
| 500 | InternalServerError | 서버 오류 |

---

### 2.2 로그인

```
POST /auth/login
```

**권한**: Public

**Request Body**:

```typescript
{
  email: string;
  password: string;
}
```

**Response** (200 OK):

```typescript
{
  isSuccess: true,
  data: {
    user: { ... },
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }
}
```

**Errors**:
| 상태 | 에러 타입 | 설명 |
|------|----------|------|
| 401 | AuthError | 잘못된 이메일 또는 비밀번호 |
| 500 | InternalServerError | 서버 오류 |

---

### 2.3 로그아웃

```
POST /auth/logout
```

**권한**: 인증 필요

**Response** (200 OK):

```typescript
{
  isSuccess: true,
  data: {
    message: "로그아웃 성공"
  }
}
```

**Errors**:
| 상태 | 에러 타입 | 설명 |
|------|----------|------|
| 401 | AuthError | 인증 실패 |

---

### 2.4 토큰 갱신

```
POST /auth/refresh
```

**권한**: Public (but requires valid refresh token)

**Request Body**:

```typescript
{
  refreshToken: string;
}
```

**Response** (200 OK):

```typescript
{
  isSuccess: true,
  data: {
    accessToken: string;
    refreshToken: string;  // 새 리프레시 토큰
    expiresIn: number;
  }
}
```

**Errors**:
| 상태 | 에러 타입 | 설명 |
|------|----------|------|
| 401 | RefreshTokenExpiredError | 리프레시 토큰 만료 |
| 401 | AuthError | 유효하지 않은 토큰 |

---

## 3. 공연 (Performances)

### 3.1 공연 목록 조회

```
GET /performances
```

**권한**: Public

**Response** (200 OK):

```typescript
{
  isSuccess: true,
  data: Performance[]
}

// Performance 타입
{
  id: number;
  name: string;
  description: string | null;
  posterImage: string | null;
  location: string | null;
  startAt: string | null;  // ISO 8601
  endAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

### 3.2 공연 상세 조회

```
GET /performances/:id
```

**권한**: Public

**Path Parameters**:

- `id`: 공연 ID (number)

**Response** (200 OK):

```typescript
{
  isSuccess: true,
  data: PerformanceDetail
}

// PerformanceDetail = Performance + teams
{
  ...Performance,
  teams: TeamWithBasicUsers[]
}
```

**Errors**:
| 상태 | 에러 타입 | 설명 |
|------|----------|------|
| 404 | NotFoundError | 공연을 찾을 수 없음 |

---

### 3.3 공연의 팀 목록 조회

```
GET /performances/:id/teams
```

**권한**: Public

**Response** (200 OK):

```typescript
{
  isSuccess: true,
  data: PerformanceTeamsList
}
```

---

### 3.4 공연 생성

```
POST /performances
```

**권한**: Admin

**Request Body**:

```typescript
{
  name: string;              // 필수
  description?: string | null;
  posterImage?: string | null;  // URL
  location?: string | null;
  startAt?: string | null;      // ISO 8601
  endAt?: string | null;
}
```

**Response** (201 Created):

```typescript
{
  isSuccess: true,
  data: PerformanceDetail
}
```

**Errors**:
| 상태 | 에러 타입 | 설명 |
|------|----------|------|
| 400 | ValidationError | 입력값 검증 실패 |
| 401 | AuthError | 인증 실패 |
| 403 | ForbiddenError | 권한 없음 (Admin 아님) |

---

### 3.5 공연 수정

```
PATCH /performances/:id
```

**권한**: Admin

**Request Body**: (부분 업데이트)

```typescript
{
  name?: string;
  description?: string | null;
  posterImage?: string | null;
  location?: string | null;
  startAt?: string | null;
  endAt?: string | null;
}
```

**Errors**:
| 상태 | 에러 타입 | 설명 |
|------|----------|------|
| 404 | NotFoundError | 공연을 찾을 수 없음 |
| 422 | InvalidPerformanceDateError | startAt >= endAt |

---

### 3.6 공연 삭제

```
DELETE /performances/:id
```

**권한**: Admin

**Response** (200 OK):

```typescript
{
  isSuccess: true,
  data: PerformanceDetail  // 삭제된 공연 정보
}
```

**참고**: 공연 삭제 시 속한 모든 팀도 Cascade 삭제

---

## 4. 팀 (Teams)

### 4.1 팀 목록 조회

```
GET /teams
```

**권한**: Public

**Response** (200 OK):

```typescript
{
  isSuccess: true,
  data: TeamList  // TeamWithBasicUsers[]
}
```

---

### 4.2 팀 상세 조회

```
GET /teams/:id
```

**권한**: Public

**Response** (200 OK):

```typescript
{
  isSuccess: true,
  data: TeamDetail
}

// TeamDetail
{
  id: number;
  name: string;
  description: string | null;
  posterImage: string | null;
  songName: string;
  songArtist: string;
  isFreshmenFixed: boolean;
  isSelfMade: boolean;
  songYoutubeVideoUrl: string | null;
  performanceId: number;
  leaderId: number;
  createdAt: string;
  updatedAt: string;
  leader: PublicUser;
  teamSessions: [
    {
      id: number;
      capacity: number;
      session: Session;
      members: [
        {
          id: number;
          index: number;
          user: PublicUser;
        }
      ]
    }
  ]
}
```

---

### 4.3 팀 생성

```
POST /teams
```

**권한**: 인증 필요

**Request Body**:

```typescript
{
  name: string;
  description?: string | null;
  leaderId: number;
  performanceId: number;
  posterImage?: string | null;
  songName: string;
  songArtist: string;
  isFreshmenFixed?: boolean;  // default: false
  isSelfMade?: boolean;       // default: false
  songYoutubeVideoUrl?: string | null;
  memberSessions: [
    {
      sessionId: number;
      capacity: number;
      members: [
        {
          userId: number;
          index: number;  // 1 ~ capacity
        }
      ]
    }
  ]
}
```

**Errors**:
| 상태 | 에러 타입 | 설명 |
|------|----------|------|
| 401 | AuthError | 인증 실패 |
| 422 | InvalidMemberIndexError | index가 1 ~ capacity 범위 밖 |
| 422 | DuplicateMemberIndexError | 같은 세션에 동일 index |
| 422 | DuplicateSessionUserError | 같은 세션에 동일 사용자 |
| 422 | DuplicateTeamSessionError | 같은 팀에 동일 세션 |
| 422 | ReferencedEntityNotFoundError | 없는 리더/세션/사용자 참조 |
| 409 | ConflictError | 데이터 충돌 |

---

### 4.4 팀 수정

```
PUT /teams/:id
```

**권한**: 팀 리더 또는 Admin

**Request Body**: CreateTeam과 동일 구조

**Errors**:
| 상태 | 에러 타입 | 설명 |
|------|----------|------|
| 403 | ForbiddenError | 권한 없음 |
| 404 | NotFoundError | 팀을 찾을 수 없음 |
| (그 외 생성과 동일)

---

### 4.5 팀 삭제

```
DELETE /teams/:id
```

**권한**: 팀 리더 또는 Admin

---

### 4.6 팀 지원 (Apply)

```
PATCH /teams/:id/apply
```

**권한**: 인증 필요

**Request Body**:

```typescript
[
  {
    sessionId: number;
    index: number;
  }
]
```

**Errors**:
| 상태 | 에러 타입 | 설명 |
|------|----------|------|
| 401 | AuthError | 인증 실패 |
| 404 | NotFoundError | 팀을 찾을 수 없음 |
| 404 | SessionNotFoundError | 세션이 팀에 없음 |
| 400 | ValidationError | index가 capacity 초과 |
| 409 | DuplicateApplicationError | 이미 해당 세션에 지원함 |
| 409 | PositionOccupiedError | 해당 포지션에 이미 다른 사람 있음 |

**Race Condition 처리**:

- DB Unique 제약으로 최종 방어
- P2002 에러 발생 시 적절한 도메인 에러로 변환

---

### 4.7 팀 지원 취소 (Unapply)

```
PATCH /teams/:id/unapply
```

**권한**: 인증 필요

**Request Body**: apply와 동일

**Errors**:
| 상태 | 에러 타입 | 설명 |
|------|----------|------|
| 404 | SessionNotFoundError | 세션이 팀에 없음 |
| 404 | NoApplicationFoundError | 지원 기록 없음 |
| 403 | ForbiddenError | 다른 사람의 지원 취소 시도 |

---

## 5. 기수 (Generations)

### 5.1 기수 목록 조회

```
GET /generations
```

**권한**: Public

**Response**: GenerationList (order 내림차순 정렬)

---

### 5.2 기수 상세 조회

```
GET /generations/:id
```

**권한**: Public

---

### 5.3 기수 생성

```
POST /generations
```

**권한**: Admin

**Request Body**:

```typescript
{
  order: number;       // 기수 번호 (unique)
  leaderId?: number;   // 기수장 ID
}
```

---

### 5.4 기수 수정

```
PATCH /generations/:id
```

**권한**: Admin

---

### 5.5 기수 삭제

```
DELETE /generations/:id
```

**권한**: Admin

**참고**: 소속 사용자가 있으면 삭제 불가 (Restrict)

---

## 6. 세션 (Sessions)

### 6.1 세션 목록 조회

```
GET /sessions
```

**권한**: Public

**Response**: SessionList (name 순 정렬, users 포함)

---

### 6.2 세션 상세 조회

```
GET /sessions/:id
```

**권한**: Public

---

### 6.3 세션 생성

```
POST /sessions
```

**권한**: Admin

**Request Body**:

```typescript
{
  name: SessionName;   // VOCAL, GUITAR, BASS, etc.
  icon?: string;       // 아이콘 URL
  leaderId?: number;   // 세션장 ID
}
```

---

### 6.4 세션 수정

```
PATCH /sessions/:id
```

**권한**: Admin

---

### 6.5 세션 삭제

```
DELETE /sessions/:id
```

**권한**: Admin

**참고**: TeamSession에서 참조 중이면 삭제 불가 (Restrict)

---

## 7. 장비 (Equipments)

### 7.1 장비 목록 조회

```
GET /equipments?type={room|item}
```

**권한**: Public

**Query Parameters**:

- `type` (optional): `room` (동아리방만) 또는 `item` (일반 장비만)

---

### 7.2 장비 상세 조회

```
GET /equipments/:id
```

**권한**: Public

**Response**: EquipmentWithRentalLog (대여 기록 포함)

---

### 7.3 장비 생성

```
POST /equipments
```

**권한**: Admin

**Request Body**:

```typescript
{
  brand: string;
  model: string;
  category: EquipCategory;
  isAvailable?: boolean;  // default: true
  description?: string;
  image?: string;
}
```

---

### 7.4 장비 수정

```
PATCH /equipments/:id
```

**권한**: Admin

---

### 7.5 장비 삭제

```
DELETE /equipments/:id
```

**권한**: Admin

**Response**: null

---

## 8. 대여 (Rentals)

### 8.1 대여 목록 조회

```
GET /rentals?type={room|item}&equipmentId={id}&from={date}&to={date}
```

**권한**: Public

**Query Parameters**:

- `type` (optional): `room` 또는 `item`
- `equipmentId` (optional): 특정 장비 필터
- `from` (optional): 시작 날짜 (ISO 8601)
- `to` (optional): 종료 날짜 (ISO 8601)

**기본 조회 범위**: 현재 날짜 기준 이전 1달 ~ 이후 2달

---

### 8.2 대여 상세 조회

```
GET /rentals/:id
```

**권한**: Public

---

### 8.3 대여 생성

```
POST /rentals
```

**권한**: 인증 필요

**Request Body**:

```typescript
{
  equipmentId: number;
  title: string;
  startAt: string;    // ISO 8601
  endAt: string;      // ISO 8601
  userIds: number[];  // 대여자 ID 배열 (최소 1명)
}
```

**Errors**:
| 상태 | 에러 타입 | 설명 |
|------|----------|------|
| 400 | ValidationError | 입력값 검증 실패 |
| 409 | ConflictError | 시간 충돌 |
| 422 | UnprocessableEntityError | 없는 장비/사용자 ID |

**시간 충돌 조건**:

```
기존.startAt < 새로운.endAt AND 기존.endAt > 새로운.startAt
```

---

### 8.4 대여 수정

```
PATCH /rentals/:id
```

**권한**: 대여 생성자 또는 Admin

**Request Body**: (부분 업데이트)

```typescript
{
  equipmentId?: number;
  title?: string;
  startAt?: string;
  endAt?: string;
  userIds?: number[];
}
```

**참고**: 시간/장비 변경 시 충돌 재검사

---

### 8.5 대여 삭제

```
DELETE /rentals/:id
```

**권한**: 대여 생성자 또는 Admin

**Response**: null

---

## 9. 사용자 (Users)

### 9.1 사용자 목록 조회

```
GET /users
```

**권한**: 인증 필요

**Response**: publicUserList (공개 정보만, 비밀번호 제외)

---

## 10. 에러 타입 URI 매핑

| 에러 클래스                   | type URI                                     | HTTP 상태 |
| ----------------------------- | -------------------------------------------- | --------- |
| ValidationError               | /errors/validation-error                     | 400       |
| AuthError                     | /errors/authentication-error                 | 401       |
| AccessTokenExpiredError       | /errors/token/access-token-expired           | 401       |
| RefreshTokenExpiredError      | /errors/token/refresh-token-expired          | 401       |
| ForbiddenError                | /errors/forbidden                            | 403       |
| NotFoundError                 | /errors/not-found                            | 404       |
| ConflictError                 | /errors/conflict                             | 409       |
| UnprocessableEntityError      | /errors/unprocessable-entity                 | 422       |
| InternalServerError           | /errors/internal-server-error                | 500       |
| DuplicateApplicationError     | /errors/team/duplicate-application           | 409       |
| PositionOccupiedError         | /errors/team/position-occupied               | 409       |
| SessionNotFoundError          | /errors/team/session-not-found               | 404       |
| NoApplicationFoundError       | /errors/team/no-application-found            | 404       |
| InvalidMemberIndexError       | /errors/team/invalid-member-index            | 422       |
| DuplicateMemberIndexError     | /errors/team/duplicate-member-index          | 422       |
| DuplicateSessionUserError     | /errors/team/duplicate-session-user          | 422       |
| DuplicateTeamSessionError     | /errors/team/duplicate-team-session          | 422       |
| ReferencedEntityNotFoundError | /errors/team/referenced-entity-not-found     | 422       |
| InvalidPerformanceDateError   | /errors/performance/invalid-performance-date | 422       |

---

## 11. 권한 요약

| 엔드포인트                                                 | 권한               |
| ---------------------------------------------------------- | ------------------ |
| `GET /performances`, `/teams`, `/sessions`, `/generations` | Public             |
| `GET /equipments`, `/rentals`                              | Public             |
| `POST /auth/signup`, `/auth/login`                         | Public             |
| `POST /teams`                                              | 인증 필요          |
| `PATCH /teams/:id/apply`, `/unapply`                       | 인증 필요          |
| `POST /rentals`                                            | 인증 필요          |
| `PUT/DELETE /teams/:id`                                    | 팀 리더 또는 Admin |
| `PATCH/DELETE /rentals/:id`                                | 생성자 또는 Admin  |
| `POST/PATCH/DELETE /performances`                          | Admin              |
| `POST/PATCH/DELETE /sessions`                              | Admin              |
| `POST/PATCH/DELETE /generations`                           | Admin              |
| `POST/PATCH/DELETE /equipments`                            | Admin              |

---

## 12. 참조 문서

| 문서 ID | 문서명           | 관계             |
| ------- | ---------------- | ---------------- |
| DOC-006 | 공유 타입        | 요청/응답 스키마 |
| DOC-008 | 인증/인가 시스템 | JWT, Guard       |
| DOC-009 | 에러 처리        | 에러 클래스 상세 |
