# DOC-005: 데이터베이스 스키마 명세서

> **문서 버전**: 1.0
> **최종 수정일**: 2026-02-04
> **작성 목적**: AI가 Prisma 스키마를 정확하게 재현하고 마이그레이션, 시드 데이터를 구성할 수 있도록 상세 명세

---

## 1. Prisma 설정

### 1.1 Generator 설정

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}
```

**설명**:

- `prisma-client-js`: Prisma Client 생성
- `output`: 생성 위치를 `packages/database/generated/prisma`로 지정
- 모노레포에서 다른 패키지가 참조할 수 있도록 상대 경로 사용

### 1.2 Datasource 설정

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**설명**:

- PostgreSQL 사용
- 환경변수에서 연결 문자열 로드

**DATABASE_URL 형식**:

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

**개발 환경 예시**:

```
postgresql://postgres:postgres@localhost:5433/amang_db
```

---

## 2. Enum 정의

### 2.1 SessionName

```prisma
enum SessionName {
  VOCAL    // 보컬
  GUITAR   // 기타
  BASS     // 베이스
  SYNTH    // 신디사이저
  DRUM     // 드럼
  STRINGS  // 현악기
  WINDS    // 관악기
}
```

**TypeScript 사용**:

```typescript
import { SessionName } from "@repo/database";

const session: SessionName = "VOCAL";
```

### 2.2 EquipCategory

```prisma
enum EquipCategory {
  ROOM             // 동아리방
  SYNTHESIZER      // 신디사이저
  MICROPHONE       // 마이크
  GUITAR           // 기타
  BASS             // 베이스
  DRUM             // 드럼
  AUDIO_INTERFACE  // 오디오 인터페이스
  CABLE            // 케이블
  AMPLIFIER        // 앰프
  SPEAKER          // 스피커
  MIXER            // 믹서
  ETC              // 그 외
}
```

---

## 3. 모델 스키마 (전문)

### 3.1 User

```prisma
model User {
  // === Primary Key ===
  id                 Int      @id @default(autoincrement())

  // === 인증 필드 ===
  email              String   @unique
  // 형식: 유효한 이메일
  // 제약: 중복 불가, 생성 후 변경 불가

  password           String
  // 저장 형식: bcrypt 해시 (salt rounds: 10)
  // 원본 규칙: 최소 8자, 영문+숫자+특수문자

  hashedRefreshToken String?
  // 용도: 리프레시 토큰 검증용
  // 저장 형식: bcrypt 해시
  // null: 로그아웃 상태

  // === 프로필 필드 ===
  name               String
  // 용도: 실명

  nickname           String   @unique
  // 용도: 표시명
  // 제약: 중복 불가

  bio                String?
  // 용도: 자기소개

  image              String?
  // 용도: 프로필 이미지 URL

  // === 권한 ===
  isAdmin            Boolean  @default(false)
  // true: 관리자 (공연/세션/기수/장비 관리 가능)

  // === 타임스탬프 ===
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // === 관계: 기수 ===
  generationId      Int
  generation        Generation  @relation(fields: [generationId], references: [id], onDelete: Restrict)
  // 삭제 정책: 사용자 존재 시 기수 삭제 불가

  leadingGeneration Generation? @relation("generationLeader")
  // 역참조: 이 사용자가 리더인 기수

  // === 관계: 세션 ===
  sessions       Session[]
  // M:N 관계: 담당 세션들 (암시적 중간 테이블)

  leadingSession Session?  @relation("sessionLeader")
  // 역참조: 이 사용자가 리더인 세션

  // === 관계: 팀 ===
  joinedTeams  TeamMember[]
  // 참여 중인 팀들

  leadingTeams Team[]       @relation("teamLeader")
  // 역참조: 이 사용자가 리더인 팀들

  // === 관계: 대여 ===
  rentalLogs EquipmentRental[]
  // M:N 관계: 대여 기록들

  @@map("users")
  // 테이블명: users
}
```

### 3.2 Generation

```prisma
model Generation {
  // === Primary Key ===
  id        Int      @id @default(autoincrement())

  // === 필드 ===
  order     Int      @unique
  // 용도: 기수 번호 (예: 39, 40, 41)
  // 제약: 양의 정수, 유니크

  // === 타임스탬프 ===
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // === 관계: 기수장 ===
  leader   User? @relation("generationLeader", fields: [leaderId], references: [id], onDelete: SetNull)
  leaderId Int?  @unique
  // 제약: 한 사용자는 최대 하나의 기수 리더만 가능
  // 삭제 정책: 리더 사용자 삭제 시 null로 설정

  // === 관계: 소속 사용자 ===
  users User[]
  // 역참조: 이 기수에 소속된 사용자들

  @@map("generations")
  // 테이블명: generations
}
```

### 3.3 Session

```prisma
model Session {
  // === Primary Key ===
  id        Int         @id @default(autoincrement())

  // === 필드 ===
  name      SessionName @unique
  // 용도: 세션 종류
  // 값: VOCAL, GUITAR, BASS, SYNTH, DRUM, STRINGS, WINDS
  // 제약: 유니크 (각 세션 타입은 하나만 존재)

  icon      String?
  // 용도: 세션 아이콘 URL

  // === 타임스탬프 ===
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  // === 관계: 세션장 ===
  leader   User? @relation("sessionLeader", fields: [leaderId], references: [id], onDelete: SetNull)
  leaderId Int?  @unique
  // 제약: 한 사용자는 최대 하나의 세션 리더만 가능
  // 삭제 정책: 리더 사용자 삭제 시 null로 설정

  // === 관계 ===
  users        User[]
  // M:N 관계: 이 세션을 담당하는 사용자들

  teamSessions TeamSession[]
  // 역참조: 이 세션을 필요로 하는 팀 세션들

  @@map("sessions")
  // 테이블명: sessions
}
```

### 3.4 Performance

```prisma
model Performance {
  // === Primary Key ===
  id Int @id @default(autoincrement())

  // === 필드 ===
  name        String
  // 용도: 공연 이름
  // 제약: 필수

  description String?
  // 용도: 공연 설명

  posterImage String?
  // 용도: 대표 이미지 URL

  location    String?
  // 용도: 공연 장소

  startAt     DateTime?
  // 용도: 공연 시작 일시
  // 제약: endAt과 함께 있을 경우 startAt < endAt

  endAt       DateTime?
  // 용도: 공연 종료 일시
  // 제약: startAt과 함께 있을 경우 startAt < endAt

  // === 타임스탬프 ===
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // === 관계: 팀 ===
  teams Team[]
  // 역참조: 이 공연에 속한 팀들
  // 삭제 시: Cascade (공연 삭제 시 팀도 삭제)

  @@map("performances")
  // 테이블명: performances
}
```

### 3.5 Team

```prisma
model Team {
  // === Primary Key ===
  id Int @id @default(autoincrement())

  // === 기본 정보 ===
  name                String
  // 용도: 팀 이름
  // 제약: 필수

  description         String?
  // 용도: 팀 설명

  posterImage         String?
  // 용도: 포스터 이미지 URL

  // === 곡 정보 ===
  songName            String
  // 용도: 곡 제목
  // 제약: 필수

  songArtist          String
  // 용도: 곡 아티스트
  // 제약: 필수

  isFreshmenFixed     Boolean @default(false)
  // 용도: 신입생 고정 여부 (true면 신입생만 지원 가능)

  isSelfMade          Boolean @default(false)
  // 용도: 자작곡 여부

  songYoutubeVideoUrl String?
  // 용도: 유튜브 영상 URL
  // 형식: 전체 URL 또는 영상 ID

  // === 타임스탬프 ===
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // === 관계: 공연 ===
  performanceId Int
  Performance   Performance @relation(fields: [performanceId], references: [id], onDelete: Cascade)
  // 제약: 필수
  // 삭제 정책: 공연 삭제 시 팀도 삭제

  // === 관계: 리더 ===
  leaderId Int
  leader   User @relation("teamLeader", fields: [leaderId], references: [id], onDelete: Restrict)
  // 제약: 필수
  // 삭제 정책: 팀 리더는 삭제 불가 (팀 먼저 삭제 필요)

  // === 관계: 세션 구성 ===
  teamSessions TeamSession[]
  // 역참조: 이 팀에 필요한 세션 목록

  @@map("teams")
  // 테이블명: teams
}
```

### 3.6 TeamSession

```prisma
model TeamSession {
  // === Primary Key ===
  id Int @id @default(autoincrement())

  // === 필드 ===
  capacity  Int
  // 용도: 필요한 인원 수
  // 제약: 양의 정수, 최소 1

  // === 타임스탬프 ===
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // === 관계: 팀 ===
  teamId Int
  team   Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  // 삭제 정책: 팀 삭제 시 함께 삭제

  // === 관계: 세션 ===
  sessionId Int
  session   Session @relation(fields: [sessionId], references: [id], onDelete: Restrict)
  // 삭제 정책: 사용 중인 세션은 삭제 불가

  // === 관계: 멤버 ===
  members TeamMember[]
  // 역참조: 이 세션에 배정된 멤버들

  // === 제약조건 ===
  @@unique([teamId, sessionId])
  // 복합 유니크: 한 팀에 같은 세션은 하나만

  @@map("team_sessions")
  // 테이블명: team_sessions
}
```

### 3.7 TeamMember

```prisma
model TeamMember {
  // === Primary Key ===
  id        Int      @id @default(autoincrement())

  // === 필드 ===
  index     Int
  // 용도: 세션 내 순서 (포지션)
  // 제약: 1 <= index <= TeamSession.capacity
  // 예: capacity=2인 세션이면 index는 1 또는 2

  // === 타임스탬프 ===
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // === 관계: TeamSession ===
  teamSessionId Int
  teamSession   TeamSession @relation(fields: [teamSessionId], references: [id], onDelete: Cascade)
  // 삭제 정책: TeamSession 삭제 시 함께 삭제

  // === 관계: User ===
  userId Int
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  // 삭제 정책: 사용자 삭제 시 함께 삭제

  // === 제약조건 ===
  @@unique([teamSessionId, userId])
  // 복합 유니크: 같은 세션에 같은 사용자 중복 불가

  @@unique([teamSessionId, index])
  // 복합 유니크: 같은 세션에 같은 포지션 중복 불가

  @@map("team_members")
  // 테이블명: team_members
}
```

### 3.8 Equipment

```prisma
model Equipment {
  // === Primary Key ===
  id Int @id @default(autoincrement())

  // === 필드 ===
  brand       String
  // 용도: 브랜드/제조사
  // 제약: 필수

  model       String
  // 용도: 모델명
  // 제약: 필수

  category    EquipCategory
  // 용도: 장비 분류
  // 제약: 필수

  isAvailable Boolean       @default(true)
  // 용도: 사용 가능 여부

  description String?
  // 용도: 설명

  image       String?
  // 용도: 이미지 URL

  // === 타임스탬프 ===
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // === 관계: 대여 기록 ===
  rentalLogs EquipmentRental[]
  // 역참조: 이 장비의 대여 기록들

  @@map("equipments")
  // 테이블명: equipments
}
```

### 3.9 EquipmentRental

```prisma
model EquipmentRental {
  // === Primary Key ===
  id Int @id @default(autoincrement())

  // === 필드 ===
  title   String
  // 용도: 예약 제목
  // 제약: 필수

  startAt DateTime
  // 용도: 시작 시간
  // 제약: 필수, startAt < endAt

  endAt   DateTime
  // 용도: 종료 시간
  // 제약: 필수, startAt < endAt

  // === 타임스탬프 ===
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // === 관계: 장비 ===
  equipment   Equipment @relation(fields: [equipmentId], references: [id], onDelete: Cascade)
  equipmentId Int
  // 삭제 정책: 장비 삭제 시 대여 기록도 삭제

  // === 관계: 대여자 ===
  users User[]
  // M:N 관계: 대여를 신청한 사용자들
  // 암시적 중간 테이블 생성

  @@map("equipment_rentals")
  // 테이블명: equipment_rentals
}
```

---

## 4. 마이그레이션 전략

### 4.1 마이그레이션 명령어

```bash
# 개발 환경: 스키마 변경 후 마이그레이션 생성 및 적용
cd packages/database
pnpm db:migrate
# 내부: prisma migrate dev

# 프로덕션 환경: 마이그레이션 적용만
pnpm db:deploy
# 내부: prisma migrate deploy

# Prisma Client 재생성
pnpm db:generate
# 내부: prisma generate
```

### 4.2 마이그레이션 히스토리 (11개)

```
migrations/
├── 20250706162100_init_user_model/
│   └── migration.sql
├── 20250712095520_implement_generation_model/
│   └── migration.sql
├── 20250725075004_add_session_model/
│   └── migration.sql
├── 20250826062353_implement_team_model/
│   └── migration.sql
├── 20250921120822_change_generation_order_from_decimal_to_integer/
│   └── migration.sql
├── 20250922063712_add_performance_model/
│   └── migration.sql
├── 20250922084154_make_performance_relation_required_and_cascade/
│   └── migration.sql
├── 20251115115923_add_equipment_and_rental_models/
│   └── migration.sql
├── 20251116083007_add_title_field_into_equipment_rental/
│   └── migration.sql
├── 20251118120925_set_on_delete_option_to_restrict_at_equipment_rental/
│   └── migration.sql
└── 20251119102727_set_on_delete_option_to_cascade/
    └── migration.sql
```

### 4.3 마이그레이션 네이밍 컨벤션

```
YYYYMMDDHHMMSS_description_in_snake_case/
```

**예시**:

- `init_user_model`: 초기 모델 생성
- `add_session_model`: 새 모델 추가
- `change_generation_order_from_decimal_to_integer`: 필드 타입 변경
- `set_on_delete_option_to_cascade`: 관계 옵션 변경

---

## 5. 시드 데이터 명세

### 5.1 시드 실행 순서

```typescript
// packages/database/prisma/seed.ts
const main = async () => {
  // 1. Sessions (기본 세션 7개)
  await seedSessions(prisma);

  // 2. Generations (기수 데이터)
  await seedGenerations(prisma);

  // 3. Users (테스트 사용자)
  await seedUsers(prisma);

  // 4. Performances (테스트 공연)
  await seedPerformance(prisma);

  // 5. Teams (테스트 팀)
  await seedTeam(prisma);

  // 6. Equipments (테스트 장비)
  await seedEquipment(prisma);

  // 7. EquipmentRentals (테스트 예약)
  await seedEquipmentRental(prisma);
};
```

**실행 명령**:

```bash
cd packages/database
pnpm db:seed
# 내부: ts-node prisma/seed.ts
```

### 5.2 Sessions 시드 데이터

```typescript
// 기본 7개 세션 생성
const sessions = [
  { name: "VOCAL" },
  { name: "GUITAR" },
  { name: "BASS" },
  { name: "SYNTH" },
  { name: "DRUM" },
  { name: "STRINGS" },
  { name: "WINDS" },
];

for (const session of sessions) {
  await prisma.session.upsert({
    where: { name: session.name },
    update: {},
    create: { name: session.name },
  });
}
```

### 5.3 Generations 시드 데이터

```typescript
// 기수 예시 (39기 ~ 41기)
const generations = [{ order: 39 }, { order: 40 }, { order: 41 }];

for (const gen of generations) {
  await prisma.generation.upsert({
    where: { order: gen.order },
    update: {},
    create: { order: gen.order },
  });
}
```

### 5.4 Users 시드 데이터

```typescript
// 환경변수에서 기본 비밀번호 가져오기
const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || "admin1234";
const hashedPassword = await bcrypt.hash(defaultPassword, 10);

// 관리자 계정
await prisma.user.upsert({
  where: { email: "admin@example.com" },
  update: {},
  create: {
    email: "admin@example.com",
    password: hashedPassword,
    name: "관리자",
    nickname: "admin",
    isAdmin: true,
    generationId: 1, // 39기
    sessions: {
      connect: [{ name: "VOCAL" }],
    },
  },
});

// 일반 사용자 계정들
const users = [
  {
    email: "user1@example.com",
    name: "홍길동",
    nickname: "user1",
    generationId: 2,
    sessions: ["GUITAR"],
  },
  {
    email: "user2@example.com",
    name: "김철수",
    nickname: "user2",
    generationId: 2,
    sessions: ["BASS"],
  },
  {
    email: "user3@example.com",
    name: "이영희",
    nickname: "user3",
    generationId: 3,
    sessions: ["DRUM"],
  },
];
```

### 5.5 Performances 시드 데이터

```typescript
const performances = [
  {
    name: "2025 봄 정기공연",
    description: "아망 2025년 봄 정기공연입니다.",
    location: "성균관대학교 600주년 기념관",
    startAt: new Date("2025-05-15T18:00:00"),
    endAt: new Date("2025-05-15T21:00:00"),
  },
  {
    name: "2025 가을 정기공연",
    description: "아망 2025년 가을 정기공연입니다.",
    location: "성균관대학교 600주년 기념관",
    startAt: new Date("2025-11-15T18:00:00"),
    endAt: new Date("2025-11-15T21:00:00"),
  },
];
```

### 5.6 Teams 시드 데이터

```typescript
const teams = [
  {
    name: "밴드 A",
    songName: "Bohemian Rhapsody",
    songArtist: "Queen",
    performanceId: 1,
    leaderId: 2, // user1
    isFreshmenFixed: false,
    isSelfMade: false,
    songYoutubeVideoUrl: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
    teamSessions: [
      { sessionId: 1, capacity: 1 }, // VOCAL x1
      { sessionId: 2, capacity: 2 }, // GUITAR x2
      { sessionId: 3, capacity: 1 }, // BASS x1
      { sessionId: 5, capacity: 1 }, // DRUM x1
    ],
  },
];
```

### 5.7 Equipments 시드 데이터

```typescript
const equipments = [
  // 동아리방
  {
    brand: "AMANG",
    model: "동아리방 A",
    category: "ROOM",
    description: "1층 합주실",
  },
  {
    brand: "AMANG",
    model: "동아리방 B",
    category: "ROOM",
    description: "2층 합주실",
  },
  // 장비
  {
    brand: "Shure",
    model: "SM58",
    category: "MICROPHONE",
    description: "보컬용 다이나믹 마이크",
  },
  {
    brand: "Fender",
    model: "American Professional II",
    category: "GUITAR",
    description: "일렉 기타",
  },
];
```

### 5.8 환경변수

```bash
# packages/database/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/amang_db"
SEED_DEFAULT_PASSWORD="admin1234"
```

---

## 6. 데이터베이스 초기화

### 6.1 전체 초기화 (개발용)

```bash
# 1. 데이터베이스 리셋 (모든 데이터 삭제)
cd packages/database
pnpm db:reset

# 내부 동작:
# - prisma migrate reset
# - 모든 테이블 DROP
# - 마이그레이션 재적용
# - seed.ts 실행
```

### 6.2 마이그레이션만 적용

```bash
# 프로덕션 환경
pnpm db:deploy

# 개발 환경 (새 마이그레이션 생성 포함)
pnpm db:migrate
```

---

## 7. 데이터베이스 테이블 매핑

| Prisma 모델             | PostgreSQL 테이블 | 설명             |
| ----------------------- | ----------------- | ---------------- |
| User                    | users             | 사용자           |
| Generation              | generations       | 기수             |
| Session                 | sessions          | 세션             |
| Performance             | performances      | 공연             |
| Team                    | teams             | 팀               |
| TeamSession             | team_sessions     | 팀 세션          |
| TeamMember              | team_members      | 팀 멤버          |
| Equipment               | equipments        | 장비             |
| EquipmentRental         | equipment_rentals | 장비 대여        |
| \_SessionToUser         | (암시적 생성)     | Session-User M:N |
| \_EquipmentRentalToUser | (암시적 생성)     | Rental-User M:N  |

---

## 8. 참조 문서

| 문서 ID | 문서명         | 관계          |
| ------- | -------------- | ------------- |
| DOC-004 | 도메인 모델    | 비즈니스 로직 |
| DOC-006 | 공유 타입      | Zod 스키마    |
| DOC-013 | 개발 환경 설정 | 환경변수      |
