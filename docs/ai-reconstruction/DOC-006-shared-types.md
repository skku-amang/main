# DOC-006: 공유 타입 명세서

> **문서 버전**: 1.0
> **최종 수정일**: 2026-02-04
> **작성 목적**: AI가 Zod 스키마, TypeScript 타입, Prisma Select/Include 패턴을 정확하게 재현할 수 있도록 상세 명세

---

## 1. 패키지 개요

### 1.1 목적

`@repo/shared-types` 패키지는 프론트엔드와 백엔드에서 공유하는 타입과 검증 스키마를 정의합니다.

- **Zod 스키마**: 런타임 검증 + TypeScript 타입 추론
- **Prisma Select/Include**: 데이터 조회 시 포함할 필드 정의
- **상수**: 정규식, 파일 검증 규칙 등

### 1.2 디렉토리 구조

```
packages/shared-types/src/
├── index.ts                       # 전체 export
├── models.type.ts                 # 기본 타입
│
├── auth/
│   ├── auth.types.ts              # 인증 응답 타입
│   └── jwt.types.ts               # JWT 페이로드 타입
│
├── user/
│   ├── user.types.ts              # User 타입, Selector
│   ├── create-user.schema.ts      # 회원가입 스키마
│   ├── update-user.schema.ts      # 프로필 수정 스키마
│   └── login-user.schema.ts       # 로그인 스키마
│
├── team/
│   ├── team.types.ts              # Team 타입, Include
│   ├── create-team.schema.ts      # 팀 생성 스키마
│   ├── update-team.schema.ts      # 팀 수정 스키마
│   └── team-application.schema.ts # 팀 지원 스키마
│
├── performance/
│   ├── performance.types.ts       # Performance 타입
│   ├── performance.schema.ts      # 공통 스키마
│   ├── create-performance.schema.ts
│   └── update-performance.schema.ts
│
├── session/
│   ├── session.types.ts           # Session 타입
│   ├── create-session.schema.ts
│   └── update-session.schema.ts
│
├── generation/
│   ├── generation.types.ts        # Generation 타입
│   ├── create-generation.schema.ts
│   └── update-generation.schema.ts
│
├── equipment/
│   ├── equipment.types.ts         # Equipment 타입
│   ├── create-equipment.schema.ts
│   └── update-equipment.schema.ts
│
├── rental/
│   ├── rental.types.ts            # Rental 타입
│   ├── create-rental.schema.ts
│   ├── update-rental.schema.ts
│   └── get-rentals.schema.ts      # 조회 쿼리 스키마
│
└── constants/
    ├── regex.ts                   # 정규식 상수
    └── file-validation.ts         # 파일 검증 규칙
```

---

## 2. Zod 스키마 규칙

### 2.1 기본 규칙

```typescript
import { z } from "zod";

// 1. 필수 문자열
z.string().min(1, "필드명은 필수입니다.");

// 2. 선택적 문자열 (nullable + optional)
z.string().nullable().optional();

// 3. 필수 정수 (양수)
z.number().int().positive();

// 4. 필수 정수 (메시지 포함)
z.number().int("ID는 정수여야 합니다.").positive();

// 5. 이메일
z.string().email({ message: "유효한 이메일 주소를 입력해주세요." });

// 6. URL
z.string().url("유효한 URL이어야 합니다.");

// 7. 정규식 검증
z.string().regex(PATTERN, { message: "형식이 올바르지 않습니다." });

// 8. 배열 (최소 개수)
z.array(z.number()).min(1, "최소 하나 이상 선택해야 합니다.");

// 9. 불리언 (기본값)
z.boolean().default(false);

// 10. 날짜
z.coerce.date(); // 문자열을 Date로 변환
```

### 2.2 nullable vs optional

| 메서드                   | null | undefined | 설명                 |
| ------------------------ | ---- | --------- | -------------------- |
| `.optional()`            | X    | O         | 생략 가능, null 불가 |
| `.nullable()`            | O    | X         | null 가능, 생략 불가 |
| `.nullable().optional()` | O    | O         | 둘 다 허용           |
| `.nullish()`             | O    | O         | 축약형               |

### 2.3 타입 추출

```typescript
// 스키마에서 타입 추출
export type CreateUser = z.infer<typeof CreateUserSchema>;

// NestJS DTO 생성 (nestjs-zod)
import { createZodDto } from "nestjs-zod";
export class CreateUserDto extends createZodDto(CreateUserSchema) {}
```

---

## 3. User 관련 스키마

### 3.1 CreateUserSchema (회원가입)

```typescript
// packages/shared-types/src/user/create-user.schema.ts
import { z } from "zod";
import { PASSWORD_REGEX } from "../constants/regex";

export const passwordField = z
  .string()
  .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." })
  .regex(PASSWORD_REGEX, {
    message: "비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.",
  });

export const CreateUserSchema = z
  .object({
    email: z.string().email({ message: "유효한 이메일 주소를 입력해주세요." }),
    password: passwordField,
    name: z.string().min(1, { message: "이름은 비워둘 수 없습니다." }),
    nickname: z.string().min(1, { message: "닉네임은 비워둘 수 없습니다." }),
    generationId: z
      .number({ invalid_type_error: "기수 ID는 숫자여야 합니다." })
      .int("기수 ID는 정수여야 합니다."),
    sessions: z
      .array(z.number().int("세션 ID는 정수여야 합니다."))
      .min(1, { message: "최소 하나의 세션을 선택해야 합니다." }),
  })
  .strict();

export type CreateUser = z.infer<typeof CreateUserSchema>;
```

**필드 명세**:
| 필드 | 타입 | 필수 | 검증 규칙 |
|------|------|------|----------|
| email | string | O | 유효한 이메일 형식 |
| password | string | O | 8자 이상, 영문+숫자+특수문자 |
| name | string | O | 1자 이상 |
| nickname | string | O | 1자 이상 |
| generationId | number | O | 정수 |
| sessions | number[] | O | 최소 1개, 정수 배열 |

### 3.2 LoginUserSchema (로그인)

```typescript
// packages/shared-types/src/user/login-user.schema.ts
import { z } from "zod";

export const LoginUserSchema = z.object({
  email: z.string().email({ message: "유효한 이메일 주소를 입력해주세요." }),
  password: z.string().min(1, { message: "비밀번호를 입력해주세요." }),
});

export type LoginUser = z.infer<typeof LoginUserSchema>;
```

### 3.3 User Selector/Include

```typescript
// packages/shared-types/src/user/user.types.ts
import { Prisma, User } from "@repo/database";

export type { User };

// 기본 사용자 정보 (목록용)
export const basicUserSelector = {
  id: true,
  name: true,
  image: true,
} satisfies Prisma.UserSelect;

// 공개 사용자 정보 (상세용)
export const publicUserSelector = {
  ...basicUserSelector,
  nickname: true,
  bio: true,
  generation: {
    select: {
      id: true,
      order: true,
    },
  },
} satisfies Prisma.UserSelect;

// 타입 추출
export type BasicUser = Prisma.UserGetPayload<{
  select: typeof basicUserSelector;
}>;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelector;
}>;
```

---

## 4. Team 관련 스키마

### 4.1 CreateTeamSchema (팀 생성)

```typescript
// packages/shared-types/src/team/create-team.schema.ts
import { z } from "zod";

export const TeamSessionSchema = z.object({
  sessionId: z.number().int().positive(),
  capacity: z.number().int().positive("세션 정원은 1 이상이어야 합니다."),
  members: z.array(
    z.object({
      userId: z.number().int().positive(),
      index: z.number().int().positive("인덱스는 1 이상이어야 합니다."),
    }),
  ),
});

export const CreateTeamSchema = z.object({
  name: z.string().min(1, "팀 이름은 필수입니다."),
  description: z.string().nullable().optional(),
  leaderId: z.number().int().positive("팀 리더 ID는 정수여야 합니다."),
  performanceId: z.number().int("공연 ID는 정수여야 합니다.").positive(),
  posterImage: z
    .string()
    .url("포스터 이미지 URL은 유효한 URL이어야 합니다.")
    .nullable()
    .optional(),
  songName: z.string().min(1, "노래 이름은 필수입니다."),
  songArtist: z.string().min(1, "노래 아티스트는 필수입니다."),
  isFreshmenFixed: z.boolean().default(false),
  isSelfMade: z.boolean().default(false),
  songYoutubeVideoUrl: z
    .string()
    .url("유튜브 영상 URL은 유효한 URL이어야 합니다.")
    .nullable()
    .optional(),
  memberSessions: z.array(TeamSessionSchema),
});

export type CreateTeam = z.infer<typeof CreateTeamSchema>;
```

**필드 명세**:
| 필드 | 타입 | 필수 | 검증 규칙 |
|------|------|------|----------|
| name | string | O | 1자 이상 |
| description | string \| null | X | - |
| leaderId | number | O | 양의 정수 |
| performanceId | number | O | 양의 정수 |
| posterImage | string \| null | X | 유효한 URL |
| songName | string | O | 1자 이상 |
| songArtist | string | O | 1자 이상 |
| isFreshmenFixed | boolean | X | 기본값 false |
| isSelfMade | boolean | X | 기본값 false |
| songYoutubeVideoUrl | string \| null | X | 유효한 URL |
| memberSessions | TeamSession[] | O | 배열 |

**TeamSession 구조**:

```typescript
{
  sessionId: number;      // 세션 ID
  capacity: number;       // 정원 (1 이상)
  members: [
    {
      userId: number;     // 사용자 ID
      index: number;      // 포지션 (1 이상)
    }
  ]
}
```

### 4.2 TeamApplicationSchema (팀 지원)

```typescript
// packages/shared-types/src/team/team-application.schema.ts
import { z } from "zod";

export const TeamApplicationSchema = z.array(
  z.object({
    sessionId: z.number().int().positive(),
    index: z.number().int().positive(),
  }),
);

export type TeamApplication = z.infer<typeof TeamApplicationSchema>;
```

### 4.3 Team Include 패턴

```typescript
// packages/shared-types/src/team/team.types.ts
import { Prisma, Team } from "@repo/database";
import { basicUserSelector, publicUserSelector } from "../user/user.types";

export type { Team };

// 기본 팀 정보 (목록용)
export const teamWithBasicUsersInclude = {
  leader: {
    select: basicUserSelector,
  },
  teamSessions: {
    include: {
      session: true,
      members: {
        include: {
          user: {
            select: basicUserSelector,
          },
        },
        orderBy: {
          index: "asc",
        },
      },
    },
  },
} satisfies Prisma.TeamInclude;

// 상세 팀 정보 (상세 페이지용)
export const teamWithPublicUsersInclude = {
  leader: {
    select: publicUserSelector,
  },
  teamSessions: {
    include: {
      session: true,
      members: {
        include: {
          user: {
            select: publicUserSelector,
          },
        },
        orderBy: {
          index: "asc",
        },
      },
    },
  },
} satisfies Prisma.TeamInclude;

// 타입 추출
export type TeamList = Prisma.TeamGetPayload<{
  include: typeof teamWithBasicUsersInclude;
}>[];

export type TeamDetail = Prisma.TeamGetPayload<{
  include: typeof teamWithPublicUsersInclude;
}>;
```

---

## 5. Performance 관련 스키마

### 5.1 CreatePerformanceSchema

```typescript
// packages/shared-types/src/performance/create-performance.schema.ts
import { z } from "zod";

export const CreatePerformanceSchema = z.object({
  name: z.string().min(1, "공연 이름은 필수입니다."),
  description: z.string().nullable().optional(),
  posterImage: z
    .string()
    .url("포스터 이미지 URL은 유효한 URL이어야 합니다.")
    .nullable()
    .optional(),
  location: z.string().nullable().optional(),
  startAt: z.coerce.date().nullable().optional(),
  endAt: z.coerce.date().nullable().optional(),
});

export type CreatePerformance = z.infer<typeof CreatePerformanceSchema>;
```

### 5.2 Performance Types

```typescript
// packages/shared-types/src/performance/performance.types.ts
import { Prisma, Performance } from "@repo/database";
import { teamWithBasicUsersInclude } from "../team/team.types";

export type { Performance };

export const performanceWithTeamsInclude = {
  teams: {
    include: teamWithBasicUsersInclude,
  },
} satisfies Prisma.PerformanceInclude;

export type PerformanceList = Performance[];

export type PerformanceDetail = Prisma.PerformanceGetPayload<{
  include: typeof performanceWithTeamsInclude;
}>;
```

---

## 6. Rental 관련 스키마

### 6.1 CreateRentalSchema

```typescript
// packages/shared-types/src/rental/create-rental.schema.ts
import { z } from "zod";

export const CreateRentalSchema = z.object({
  equipmentId: z.number().int().positive("장비 ID는 양의 정수여야 합니다."),
  title: z.string().min(1, "예약 제목은 필수입니다."),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  userIds: z
    .array(z.number().int().positive())
    .min(1, "최소 1명의 사용자를 지정해야 합니다."),
});

export type CreateRental = z.infer<typeof CreateRentalSchema>;
```

### 6.2 GetRentalsSchema (조회 쿼리)

```typescript
// packages/shared-types/src/rental/get-rentals.schema.ts
import { z } from "zod";

export const GetRentalsSchema = z.object({
  type: z.enum(["room", "item"]).optional(),
  equipmentId: z.coerce.number().int().positive().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type GetRentals = z.infer<typeof GetRentalsSchema>;
```

---

## 7. 상수 정의

### 7.1 정규식 상수

```typescript
// packages/shared-types/src/constants/regex.ts

// 비밀번호: 영문, 숫자, 특수문자 모두 포함
export const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).+$/;

// 유튜브 URL 또는 영상 ID
export const YOUTUBE_URL_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
```

### 7.2 파일 검증 규칙

```typescript
// packages/shared-types/src/constants/file-validation.ts

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
```

---

## 8. 인증 관련 타입

### 8.1 JWT 페이로드

```typescript
// packages/shared-types/src/auth/jwt.types.ts

export interface JwtPayload {
  sub: number; // userId
  email: string;
  name: string;
  isAdmin: boolean;
}
```

### 8.2 인증 응답 타입

```typescript
// packages/shared-types/src/auth/auth.types.ts

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // 만료 시간 (초)
}

export interface AuthResponse extends AuthTokens {
  user: {
    id: number;
    email: string;
    name: string;
    nickname: string;
    isAdmin: boolean;
  };
}
```

---

## 9. Index.ts (전체 Export)

```typescript
// packages/shared-types/src/index.ts

// User
export * from "./user/user.types";
export * from "./user/create-user.schema";
export * from "./user/update-user.schema";
export * from "./user/login-user.schema";

// Team
export * from "./team/team.types";
export * from "./team/create-team.schema";
export * from "./team/update-team.schema";
export * from "./team/team-application.schema";

// Performance
export * from "./performance/performance.types";
export * from "./performance/performance.schema";
export * from "./performance/create-performance.schema";
export * from "./performance/update-performance.schema";

// Session
export * from "./session/session.types";
export * from "./session/create-session.schema";
export * from "./session/update-session.schema";

// Generation
export * from "./generation/generation.types";
export * from "./generation/create-generation.schema";
export * from "./generation/update-generation.schema";

// Equipment
export * from "./equipment/equipment.types";
export * from "./equipment/create-equipment.schema";
export * from "./equipment/update-equipment.schema";

// Rental
export * from "./rental/rental.types";
export * from "./rental/create-rental.schema";
export * from "./rental/update-rental.schema";
export * from "./rental/get-rentals.schema";

// Auth
export * from "./auth/auth.types";
export * from "./auth/jwt.types";

// Constants
export * from "./constants/regex";
export * from "./constants/file-validation";
```

---

## 10. 사용 예시

### 10.1 프론트엔드에서 사용

```typescript
// apps/web에서 import
import {
  CreateTeamSchema,
  type CreateTeam,
  type TeamDetail,
} from "@repo/shared-types";

// React Hook Form + Zod
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm<CreateTeam>({
  resolver: zodResolver(CreateTeamSchema),
  defaultValues: {
    isFreshmenFixed: false,
    isSelfMade: false,
    memberSessions: [],
  },
});
```

### 10.2 백엔드에서 사용

```typescript
// apps/api에서 import
import { CreateTeamSchema } from '@repo/shared-types';
import { createZodDto } from 'nestjs-zod';

// DTO 생성
export class CreateTeamDto extends createZodDto(CreateTeamSchema) {}

// Controller에서 사용
@Post()
async create(@Body() dto: CreateTeamDto) {
  return this.teamService.create(dto);
}
```

### 10.3 Prisma Include 사용

```typescript
// Service에서 사용
import { teamWithPublicUsersInclude } from '@repo/shared-types';

async findOne(id: number) {
  return this.prisma.team.findUnique({
    where: { id },
    include: teamWithPublicUsersInclude
  });
}
```

---

## 11. 참조 문서

| 문서 ID | 문서명      | 관계           |
| ------- | ----------- | -------------- |
| DOC-004 | 도메인 모델 | 비즈니스 규칙  |
| DOC-005 | DB 스키마   | Prisma 모델    |
| DOC-007 | API 명세    | 요청/응답 타입 |
