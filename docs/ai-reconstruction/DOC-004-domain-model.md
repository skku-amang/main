# DOC-004: 도메인 모델 설계서

> **문서 버전**: 1.0
> **최종 수정일**: 2026-02-04
> **작성 목적**: AI가 도메인 엔티티, 관계, 비즈니스 규칙을 정확하게 구현할 수 있도록 상세 명세

---

## 1. 엔티티 관계 다이어그램 (ERD)

### 1.1 전체 ERD

```
┌─────────────────┐                    ┌─────────────────┐
│   Generation    │                    │     Session     │
│─────────────────│                    │─────────────────│
│ id              │                    │ id              │
│ order (unique)  │                    │ name (unique)   │
│ leaderId? ──────┼──┐                 │ icon?           │
│ createdAt       │  │                 │ leaderId? ──────┼──┐
│ updatedAt       │  │                 │ createdAt       │  │
└────────┬────────┘  │                 │ updatedAt       │  │
         │           │                 └────────┬────────┘  │
         │ 1:N       │ 1:1?                     │           │ 1:1?
         │           │                          │ M:N       │
         ▼           │                          ▼           │
┌─────────────────┐  │     ┌────────────────────────────┐  │
│      User       │◀─┘     │                            │  │
│─────────────────│◀───────┼────────────────────────────┼──┘
│ id              │        │                            │
│ email (unique)  │        │                            │
│ password        │        │                            │
│ name            │        │                            │
│ nickname(unique)│        │                            │
│ bio?            │        │                            │
│ image?          │        │                            │
│ isAdmin         │        │                            │
│ hashedRefresh?  │        │                            │
│ generationId ───┼────────┘                            │
│ createdAt       │                                     │
│ updatedAt       │◀────────────────────────────────────┘
└────────┬────────┘
         │
         │ 1:N (leader)          1:N (member)
         │                            │
         ▼                            ▼
┌─────────────────┐          ┌─────────────────┐
│      Team       │          │   TeamMember    │
│─────────────────│          │─────────────────│
│ id              │          │ id              │
│ name            │          │ index           │
│ description?    │          │ teamSessionId ──┼──┐
│ posterImage?    │          │ userId ─────────┼──┼──▶ User
│ songName        │          │ createdAt       │  │
│ songArtist      │          │ updatedAt       │  │
│ isFreshmenFixed │          └─────────────────┘  │
│ isSelfMade      │                 ▲              │
│ songYoutubeUrl? │                 │ 1:N          │
│ performanceId ──┼──┐              │              │
│ leaderId ───────┼──┼──▶ User     │              │
│ createdAt       │  │              │              │
│ updatedAt       │  │     ┌────────┴────────┐    │
└────────┬────────┘  │     │   TeamSession   │◀───┘
         │           │     │─────────────────│
         │ 1:N       │     │ id              │
         ▼           │     │ capacity        │
┌─────────────────┐  │     │ teamId ─────────┼──┐
│   Performance   │◀─┘     │ sessionId ──────┼──┼──▶ Session
│─────────────────│        │ createdAt       │  │
│ id              │        │ updatedAt       │  │
│ name            │        └─────────────────┘  │
│ description?    │               ▲              │
│ posterImage?    │               │              │
│ location?       │               │              │
│ startAt?        │               └──────────────┘
│ endAt?          │
│ createdAt       │
│ updatedAt       │
└─────────────────┘


┌─────────────────┐          ┌───────────────────┐
│   Equipment     │          │  EquipmentRental  │
│─────────────────│          │───────────────────│
│ id              │          │ id                │
│ brand           │          │ title             │
│ model           │  1:N     │ startAt           │
│ category        │─────────▶│ endAt             │
│ isAvailable     │          │ equipmentId ──────┼──▶ Equipment
│ description?    │          │ users[] ──────────┼──▶ User (M:N)
│ image?          │          │ createdAt         │
│ createdAt       │          │ updatedAt         │
│ updatedAt       │          └───────────────────┘
└─────────────────┘
```

### 1.2 관계 요약

| 관계                        | 타입           | 설명                         | 삭제 정책 |
| --------------------------- | -------------- | ---------------------------- | --------- |
| User → Generation           | N:1            | 사용자는 하나의 기수에 소속  | Restrict  |
| User → Session              | M:N            | 사용자는 여러 세션 담당 가능 | -         |
| Generation → User (leader)  | 1:1 (optional) | 기수장                       | SetNull   |
| Session → User (leader)     | 1:1 (optional) | 세션장                       | SetNull   |
| Performance → Team          | 1:N            | 공연은 여러 팀 포함          | Cascade   |
| Team → User (leader)        | N:1            | 팀 리더                      | Restrict  |
| Team → TeamSession          | 1:N            | 팀은 여러 세션 구성          | Cascade   |
| TeamSession → Session       | N:1            | 세션 참조                    | Restrict  |
| TeamSession → TeamMember    | 1:N            | 세션별 멤버                  | Cascade   |
| TeamMember → User           | N:1            | 멤버는 사용자                | Cascade   |
| Equipment → EquipmentRental | 1:N            | 장비별 대여 기록             | Cascade   |
| EquipmentRental → User      | M:N            | 대여자들                     | -         |

---

## 2. 엔티티 상세 정의

### 2.1 User (사용자)

```prisma
model User {
  // Primary Key
  id                 Int      @id @default(autoincrement())

  // 인증 정보
  email              String   @unique    // 로그인 ID
  password           String              // bcrypt 해시
  hashedRefreshToken String?             // 리프레시 토큰 해시

  // 프로필 정보
  name               String              // 실명
  nickname           String   @unique    // 표시명 (중복 불가)
  bio                String?             // 자기소개
  image              String?             // 프로필 이미지 URL

  // 권한
  isAdmin            Boolean  @default(false)

  // 타임스탬프
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // 관계 - 기수
  generationId       Int
  generation         Generation  @relation(...)
  leadingGeneration  Generation? @relation("generationLeader")

  // 관계 - 세션
  sessions           Session[]   // M:N 세션 담당
  leadingSession     Session?    @relation("sessionLeader")

  // 관계 - 팀
  joinedTeams        TeamMember[]
  leadingTeams       Team[]      @relation("teamLeader")

  // 관계 - 대여
  rentalLogs         EquipmentRental[]

  @@map("users")
}
```

**비즈니스 규칙**:

1. `email`: 생성 후 변경 불가
2. `password`: 최소 8자, 영문+숫자+특수문자 조합
3. `nickname`: 중복 불가
4. `isAdmin`: true인 경우 관리자 권한
5. 한 명의 사용자는 최대 하나의 기수/세션의 리더만 가능

**Unique 제약**:

- `email` (단일)
- `nickname` (단일)

### 2.2 Generation (기수)

```prisma
model Generation {
  id        Int      @id @default(autoincrement())
  order     Int      @unique    // 기수 번호 (예: 39, 40, 41)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 기수장 (optional)
  leader    User?    @relation("generationLeader", ...)
  leaderId  Int?     @unique

  // 소속 사용자들
  users     User[]

  @@map("generations")
}
```

**비즈니스 규칙**:

1. `order`: 양의 정수, 유니크
2. `leaderId`: 한 사용자는 최대 하나의 기수의 리더만 가능
3. 삭제 시: 소속 사용자가 있으면 삭제 불가 (Restrict)

**Unique 제약**:

- `order` (단일)
- `leaderId` (단일)

### 2.3 Session (악기 세션)

```prisma
model Session {
  id        Int         @id @default(autoincrement())
  name      SessionName @unique    // VOCAL, GUITAR, BASS, etc.
  icon      String?                // 아이콘 URL
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  // 세션장 (optional)
  leader    User?       @relation("sessionLeader", ...)
  leaderId  Int?        @unique

  // 관계
  users         User[]          // 세션 담당 사용자들
  teamSessions  TeamSession[]   // 팀에서 이 세션을 필요로 하는 경우

  @@map("sessions")
}
```

**Enum - SessionName**:

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

**비즈니스 규칙**:

1. `name`: SessionName enum 값, 유니크
2. `leaderId`: 한 사용자는 최대 하나의 세션의 리더만 가능
3. 기본 세션 7개는 시스템 초기화 시 생성

**Unique 제약**:

- `name` (단일)
- `leaderId` (단일)

### 2.4 Performance (공연)

```prisma
model Performance {
  id          Int       @id @default(autoincrement())

  name        String    // 공연 이름 (필수)
  description String?   // 공연 설명
  posterImage String?   // 대표 이미지 URL
  location    String?   // 공연 장소
  startAt     DateTime? // 공연 시작 일시
  endAt       DateTime? // 공연 종료 일시

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  teams       Team[]    // 이 공연에 속한 팀들

  @@map("performances")
}
```

**비즈니스 규칙**:

1. `name`: 필수 입력
2. `startAt`, `endAt`: 둘 다 입력된 경우 startAt < endAt
3. 삭제 시: 속한 모든 Team도 Cascade 삭제

### 2.5 Team (팀)

```prisma
model Team {
  id                  Int      @id @default(autoincrement())

  name                String   // 팀 이름 (필수)
  description         String?  // 팀 설명
  posterImage         String?  // 포스터 이미지 URL
  songName            String   // 곡 제목 (필수)
  songArtist          String   // 곡 아티스트 (필수)
  isFreshmenFixed     Boolean  @default(false)  // 신입생 고정 여부
  isSelfMade          Boolean  @default(false)  // 자작곡 여부
  songYoutubeVideoUrl String?  // 유튜브 영상 URL

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // 공연 참조 (필수)
  performanceId       Int
  Performance         Performance @relation(..., onDelete: Cascade)

  // 팀 리더 (필수)
  leaderId            Int
  leader              User @relation("teamLeader", ..., onDelete: Restrict)

  // 세션 구성
  teamSessions        TeamSession[]

  @@map("teams")
}
```

**비즈니스 규칙**:

1. `name`, `songName`, `songArtist`: 필수 입력
2. `performanceId`: 유효한 공연 참조 필수
3. `leaderId`: 유효한 사용자 참조 필수
4. 리더 삭제 시: Restrict (삭제 불가)
5. 공연 삭제 시: Cascade (팀도 삭제)

### 2.6 TeamSession (팀 세션)

```prisma
model TeamSession {
  id        Int      @id @default(autoincrement())

  capacity  Int      // 필요한 인원 수 (필수)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 팀 참조 (필수)
  teamId    Int
  team      Team @relation(..., onDelete: Cascade)

  // 세션 참조 (필수)
  sessionId Int
  session   Session @relation(..., onDelete: Restrict)

  // 배정된 멤버들
  members   TeamMember[]

  @@unique([teamId, sessionId])  // 한 팀에 같은 세션 중복 불가
  @@map("team_sessions")
}
```

**비즈니스 규칙**:

1. `capacity`: 양의 정수, 최소 1
2. 한 팀에 같은 세션은 하나만 존재 가능
3. 팀 삭제 시: Cascade
4. 세션 삭제 시: Restrict (삭제 불가)

**Unique 제약**:

- `(teamId, sessionId)` (복합)

### 2.7 TeamMember (팀 멤버)

```prisma
model TeamMember {
  id            Int      @id @default(autoincrement())

  index         Int      // 세션 내 순서 (1부터 시작)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // TeamSession 참조
  teamSessionId Int
  teamSession   TeamSession @relation(..., onDelete: Cascade)

  // 사용자 참조
  userId        Int
  user          User @relation(..., onDelete: Cascade)

  @@unique([teamSessionId, userId])  // 같은 세션에 같은 사용자 중복 불가
  @@unique([teamSessionId, index])   // 같은 세션에 같은 인덱스 중복 불가
  @@map("team_members")
}
```

**비즈니스 규칙**:

1. `index`: 1 <= index <= TeamSession.capacity
2. 같은 TeamSession 내에서 userId는 유니크 (중복 지원 불가)
3. 같은 TeamSession 내에서 index는 유니크 (포지션 중복 불가)
4. TeamSession 삭제 시: Cascade
5. User 삭제 시: Cascade

**Unique 제약**:

- `(teamSessionId, userId)` (복합)
- `(teamSessionId, index)` (복합)

### 2.8 Equipment (장비)

```prisma
model Equipment {
  id          Int           @id @default(autoincrement())

  brand       String        // 브랜드/제조사 (필수)
  model       String        // 모델명 (필수)
  category    EquipCategory // 장비 분류 (필수)
  isAvailable Boolean       @default(true)  // 사용 가능 여부
  description String?       // 설명
  image       String?       // 이미지 URL

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  rentalLogs  EquipmentRental[]

  @@map("equipments")
}
```

**Enum - EquipCategory**:

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

**비즈니스 규칙**:

1. `brand`, `model`, `category`: 필수 입력
2. `isAvailable`: 기본값 true
3. `category = ROOM`: 동아리방 예약용

### 2.9 EquipmentRental (장비 대여)

```prisma
model EquipmentRental {
  id          Int       @id @default(autoincrement())

  title       String    // 예약 제목 (필수)
  startAt     DateTime  // 시작 시간 (필수)
  endAt       DateTime  // 종료 시간 (필수)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // 장비 참조
  equipmentId Int
  equipment   Equipment @relation(..., onDelete: Cascade)

  // 대여자들 (M:N)
  users       User[]

  @@map("equipment_rentals")
}
```

**비즈니스 규칙**:

1. `title`, `startAt`, `endAt`: 필수 입력
2. `startAt < endAt` 검증
3. 동일 장비의 시간 충돌 불가
4. `users`: 최소 1명 이상
5. 장비 삭제 시: Cascade

---

## 3. 핵심 비즈니스 로직

### 3.1 팀 지원 (Apply)

```typescript
// 입력: teamId, userId, applications: [{sessionId, index}]
async apply(teamId: number, userId: number, applications: Application[]) {
  // 1. 팀 존재 확인
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { teamSessions: true }
  });
  if (!team) throw new NotFoundError("팀을 찾을 수 없습니다.");

  // 2. 각 지원에 대해 검증
  for (const app of applications) {
    // 2.1 세션이 팀에 존재하는가?
    const teamSession = team.teamSessions.find(ts => ts.sessionId === app.sessionId);
    if (!teamSession) {
      throw new SessionNotFoundError(`세션 ID ${app.sessionId}가 이 팀에 없습니다.`);
    }

    // 2.2 index가 1 ~ capacity 범위인가?
    if (app.index < 1 || app.index > teamSession.capacity) {
      throw new InvalidMemberIndexError(
        `인덱스는 1에서 ${teamSession.capacity} 사이여야 합니다.`
      );
    }

    // 2.3 이미 해당 세션에 지원했는가?
    const existingByUser = await prisma.teamMember.findUnique({
      where: { teamSessionId_userId: { teamSessionId: teamSession.id, userId } }
    });
    if (existingByUser) {
      throw new DuplicateApplicationError("이미 해당 세션에 지원했습니다.");
    }

    // 2.4 해당 index에 다른 사람이 있는가?
    const existingByIndex = await prisma.teamMember.findUnique({
      where: { teamSessionId_index: { teamSessionId: teamSession.id, index: app.index } }
    });
    if (existingByIndex) {
      throw new PositionOccupiedError("해당 포지션은 이미 다른 사람이 지원했습니다.");
    }
  }

  // 3. 생성 (Race Condition 방어)
  try {
    await prisma.teamMember.createMany({
      data: applications.map(app => ({
        teamSessionId: team.teamSessions.find(ts => ts.sessionId === app.sessionId)!.id,
        userId,
        index: app.index
      }))
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Unique 제약 위반
        const target = (error.meta?.target as string[]) || [];
        if (target.includes('userId')) {
          throw new DuplicateApplicationError("이미 해당 세션에 지원했습니다.");
        }
        if (target.includes('index')) {
          throw new PositionOccupiedError("해당 포지션은 이미 다른 사람이 지원했습니다.");
        }
      }
    }
    throw error;
  }
}
```

### 3.2 팀 지원 취소 (Unapply)

```typescript
// 입력: teamId, userId, applications: [{sessionId, index}]
async unapply(teamId: number, userId: number, applications: Application[]) {
  // 1. 팀 존재 확인
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { teamSessions: { include: { members: true } } }
  });
  if (!team) throw new NotFoundError("팀을 찾을 수 없습니다.");

  // 2. 각 취소에 대해 검증
  const toDelete: number[] = [];

  for (const app of applications) {
    // 2.1 세션이 팀에 존재하는가?
    const teamSession = team.teamSessions.find(ts => ts.sessionId === app.sessionId);
    if (!teamSession) {
      throw new SessionNotFoundError(`세션 ID ${app.sessionId}가 이 팀에 없습니다.`);
    }

    // 2.2 해당 index에 지원 기록이 있는가?
    const member = teamSession.members.find(m => m.index === app.index);
    if (!member) {
      throw new NoApplicationFoundError("해당 포지션에 지원 기록이 없습니다.");
    }

    // 2.3 본인의 지원인가?
    if (member.userId !== userId) {
      throw new ForbiddenError("다른 사용자의 지원을 취소할 수 없습니다.");
    }

    toDelete.push(member.id);
  }

  // 3. 삭제
  await prisma.teamMember.deleteMany({
    where: { id: { in: toDelete } }
  });
}
```

### 3.3 장비 예약 시간 충돌 감지

```typescript
// 입력: equipmentId, startAt, endAt, excludeRentalId? (수정 시)
async checkTimeConflict(
  equipmentId: number,
  startAt: Date,
  endAt: Date,
  excludeRentalId?: number
) {
  // 충돌 조건: 기존.startAt < 새로운.endAt AND 기존.endAt > 새로운.startAt
  const conflicting = await prisma.equipmentRental.findFirst({
    where: {
      equipmentId,
      id: excludeRentalId ? { not: excludeRentalId } : undefined,
      AND: [
        { startAt: { lt: endAt } },
        { endAt: { gt: startAt } }
      ]
    }
  });

  if (conflicting) {
    throw new ConflictError("해당 시간에 이미 예약이 존재합니다.");
  }
}
```

**시간 충돌 시각화**:

```
기존 예약:      |--------|
새 예약 1:   |---|               ❌ 충돌 (startAt < 기존.endAt)
새 예약 2:            |---|      ❌ 충돌 (endAt > 기존.startAt)
새 예약 3:   |-------------|     ❌ 충돌 (완전 포함)
새 예약 4:         |----|        ❌ 충돌 (내부)
새 예약 5: |--|                  ✅ OK (기존 시작 전)
새 예약 6:               |--|    ✅ OK (기존 종료 후)
```

### 3.4 팀 생성/수정 트랜잭션

```typescript
// 팀 생성 - 복합 트랜잭션
async createTeam(dto: CreateTeamDto) {
  return prisma.$transaction(async (tx) => {
    // 1. 팀 기본 정보 생성
    const team = await tx.team.create({
      data: {
        name: dto.name,
        songName: dto.songName,
        songArtist: dto.songArtist,
        performanceId: dto.performanceId,
        leaderId: dto.leaderId,
        // ... 기타 필드
      }
    });

    // 2. TeamSession 및 TeamMember 생성
    for (const sessionDto of dto.memberSessions) {
      // 중복 세션 검사
      const existingSession = await tx.teamSession.findUnique({
        where: { teamId_sessionId: { teamId: team.id, sessionId: sessionDto.sessionId } }
      });
      if (existingSession) {
        throw new DuplicateTeamSessionError("같은 세션을 중복 추가할 수 없습니다.");
      }

      // 멤버 검증
      const indices = new Set<number>();
      const userIds = new Set<number>();

      for (const member of sessionDto.members) {
        // index 범위 검사
        if (member.index < 1 || member.index > sessionDto.capacity) {
          throw new InvalidMemberIndexError(
            `인덱스는 1에서 ${sessionDto.capacity} 사이여야 합니다.`
          );
        }

        // index 중복 검사
        if (indices.has(member.index)) {
          throw new DuplicateMemberIndexError("같은 인덱스에 중복 배정할 수 없습니다.");
        }
        indices.add(member.index);

        // userId 중복 검사
        if (userIds.has(member.userId)) {
          throw new DuplicateSessionUserError("같은 세션에 같은 사용자를 중복 배정할 수 없습니다.");
        }
        userIds.add(member.userId);
      }

      // TeamSession 생성 (nested members)
      await tx.teamSession.create({
        data: {
          teamId: team.id,
          sessionId: sessionDto.sessionId,
          capacity: sessionDto.capacity,
          members: {
            create: sessionDto.members.map(m => ({
              userId: m.userId,
              index: m.index
            }))
          }
        }
      });
    }

    return team;
  });
}
```

---

## 4. 삭제 정책 (Cascade/Restrict) 요약

| 부모 → 자식                 | 정책     | 설명                                |
| --------------------------- | -------- | ----------------------------------- |
| Performance → Team          | Cascade  | 공연 삭제 시 팀도 삭제              |
| Team → TeamSession          | Cascade  | 팀 삭제 시 세션 구성도 삭제         |
| TeamSession → TeamMember    | Cascade  | 세션 구성 삭제 시 멤버도 삭제       |
| Equipment → EquipmentRental | Cascade  | 장비 삭제 시 대여 기록도 삭제       |
| User → TeamMember           | Cascade  | 사용자 삭제 시 팀 참여 기록도 삭제  |
| Generation → User           | Restrict | 소속 사용자가 있으면 기수 삭제 불가 |
| Team → User (leader)        | Restrict | 팀 리더는 삭제 불가                 |
| Session → TeamSession       | Restrict | 팀에서 사용 중인 세션 삭제 불가     |
| Generation → User (leader)  | SetNull  | 기수장 삭제 시 leaderId null        |
| Session → User (leader)     | SetNull  | 세션장 삭제 시 leaderId null        |

---

## 5. 인덱스 및 제약조건 요약

### 5.1 Unique 제약

| 모델        | 제약 | 필드                    |
| ----------- | ---- | ----------------------- |
| User        | 단일 | email                   |
| User        | 단일 | nickname                |
| Generation  | 단일 | order                   |
| Generation  | 단일 | leaderId                |
| Session     | 단일 | name                    |
| Session     | 단일 | leaderId                |
| TeamSession | 복합 | (teamId, sessionId)     |
| TeamMember  | 복합 | (teamSessionId, userId) |
| TeamMember  | 복합 | (teamSessionId, index)  |

### 5.2 자동 생성 인덱스

- 모든 `@id` 필드
- 모든 `@unique` 필드
- 모든 `@relation` FK 필드

---

## 6. 참조 문서

| 문서 ID | 문서명        | 관계               |
| ------- | ------------- | ------------------ |
| DOC-001 | 프로젝트 개요 | 요구사항 기반      |
| DOC-005 | DB 스키마     | Prisma 스키마 상세 |
| DOC-006 | 공유 타입     | Zod 스키마         |
| DOC-007 | API 명세      | 엔드포인트 구현    |
