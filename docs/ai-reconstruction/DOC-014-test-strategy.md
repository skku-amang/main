# DOC-014: 테스트 전략 문서

> AI 재구성을 위한 상세 명세

---

## 1. 개요

AMANG 프로젝트는 Jest를 기반으로 한 테스트 환경을 사용합니다. 백엔드(NestJS)에서 단위 테스트와 E2E 테스트를 지원합니다.

---

## 2. 테스트 피라미드

```
          ┌───────────┐
          │   E2E     │  5%
          │  Tests    │
          ├───────────┤
          │Integration│  25%
          │  Tests    │
          ├───────────┤
          │   Unit    │  70%
          │  Tests    │
          └───────────┘
```

| 테스트 유형 | 비율 | 도구                  | 대상                    |
| ----------- | ---- | --------------------- | ----------------------- |
| 단위 테스트 | 70%  | Jest                  | Services, Guards, Pipes |
| 통합 테스트 | 25%  | Jest + NestJS Testing | Controllers, Modules    |
| E2E 테스트  | 5%   | Supertest             | API 엔드포인트          |

---

## 3. 테스트 환경 설정

### 3.1 Jest 설정 (단위/통합)

**파일**: `apps/api/package.json`

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

### 3.2 E2E 테스트 설정

**파일**: `apps/api/test/jest-e2e.json`

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

---

## 4. 테스트 실행 명령어

### 4.1 단위 테스트

```bash
# 전체 단위 테스트 실행
cd apps/api && pnpm test

# 감시 모드로 실행
cd apps/api && pnpm test:watch

# 커버리지 리포트 생성
cd apps/api && pnpm test:cov

# 특정 파일만 테스트
cd apps/api && pnpm test -- team.service.spec.ts
```

### 4.2 E2E 테스트

```bash
cd apps/api && pnpm test:e2e
```

### 4.3 디버그 모드

```bash
cd apps/api && pnpm test:debug
```

---

## 5. 단위 테스트 패턴

### 5.1 서비스 테스트

**파일**: `apps/api/src/team/team.service.spec.ts`

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { TeamService } from "./team.service";
import { PrismaService } from "../prisma/prisma.service";

describe("TeamService", () => {
  let service: TeamService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        {
          provide: PrismaService,
          useValue: {
            team: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            teamMember: {
              createMany: jest.fn(),
              deleteMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOne", () => {
    it("should return a team when found", async () => {
      const mockTeam = { id: 1, songName: "테스트 곡" };
      jest.spyOn(prisma.team, "findUnique").mockResolvedValue(mockTeam as any);

      const result = await service.findOne(1);
      expect(result).toEqual(mockTeam);
    });

    it("should throw NotFoundError when team not found", async () => {
      jest.spyOn(prisma.team, "findUnique").mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundError);
    });
  });
});
```

### 5.2 컨트롤러 테스트

**파일**: `apps/api/src/team/team.controller.spec.ts`

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { TeamController } from "./team.controller";
import { TeamService } from "./team.service";

describe("TeamController", () => {
  let controller: TeamController;
  let service: TeamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamController],
      providers: [
        {
          provide: TeamService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            apply: jest.fn(),
            unapply: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TeamController>(TeamController);
    service = module.get<TeamService>(TeamService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findOne", () => {
    it("should return a team", async () => {
      const mockTeam = { id: 1, songName: "테스트 곡" };
      jest.spyOn(service, "findOne").mockResolvedValue(mockTeam as any);

      const result = await controller.findOne("1");
      expect(result).toEqual({
        isSuccess: true,
        isFailure: false,
        data: mockTeam,
      });
    });
  });
});
```

### 5.3 Prisma 서비스 Mocking

```typescript
// 기본 mock 패턴
const mockPrismaService = {
  team: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  teamSession: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  teamMember: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrismaService)),
};
```

---

## 6. E2E 테스트 패턴

### 6.1 기본 E2E 테스트

**파일**: `apps/api/test/app.e2e-spec.ts`

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect("Hello World!");
  });
});
```

### 6.2 인증이 필요한 E2E 테스트

```typescript
describe("Teams (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    // 앱 초기화
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 로그인하여 토큰 획득
    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "test@example.com", password: "password123!" });

    accessToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /teams/:id", () => {
    it("should return a team", async () => {
      const response = await request(app.getHttpServer())
        .get("/teams/1")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.isSuccess).toBe(true);
      expect(response.body.data).toHaveProperty("id");
    });

    it("should return 404 for non-existent team", async () => {
      const response = await request(app.getHttpServer())
        .get("/teams/99999")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body.isFailure).toBe(true);
      expect(response.body.error.type).toBe("/errors/not-found");
    });
  });
});
```

---

## 7. 테스트 파일 구조

### 7.1 파일 명명 규칙

| 유형        | 파일명 패턴     | 위치                      |
| ----------- | --------------- | ------------------------- |
| 단위 테스트 | `*.spec.ts`     | 소스 파일과 같은 디렉토리 |
| E2E 테스트  | `*.e2e-spec.ts` | `test/` 디렉토리          |

### 7.2 현재 테스트 파일 목록

```
apps/api/
├── src/
│   ├── app.controller.spec.ts
│   ├── auth/
│   │   ├── auth.service.spec.ts
│   │   └── auth.controller.spec.ts
│   ├── generation/
│   │   ├── generation.service.spec.ts
│   │   └── generation.controller.spec.ts
│   ├── session/
│   │   ├── session.service.spec.ts
│   │   └── session.controller.spec.ts
│   ├── performance/
│   │   ├── performance.service.spec.ts
│   │   └── performance.controller.spec.ts
│   ├── team/
│   │   ├── team.service.spec.ts
│   │   └── team.controller.spec.ts
│   ├── equipment/
│   │   ├── equipment.service.spec.ts
│   │   └── equipment.controller.spec.ts
│   ├── rental/
│   │   ├── rental.service.spec.ts
│   │   └── rental.controller.spec.ts
│   ├── users/
│   │   ├── users.service.spec.ts
│   │   └── users.controller.spec.ts
│   └── prisma/
│       └── prisma.service.spec.ts
└── test/
    └── jest-e2e.json
```

---

## 8. 테스트 유틸리티

### 8.1 Mock Factory

```typescript
// test/utils/mock-factory.ts
export const createMockPrismaService = () => ({
  team: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // ... other models
  $transaction: jest.fn(),
});

export const createMockUser = (overrides = {}) => ({
  id: 1,
  email: "test@example.com",
  name: "테스트 사용자",
  nickname: "테스터",
  isAdmin: false,
  ...overrides,
});
```

### 8.2 테스트 데이터 생성

```typescript
// test/utils/test-data.ts
export const mockTeam = {
  id: 1,
  songName: "테스트 곡",
  songArtist: "테스트 아티스트",
  leaderId: 1,
  performanceId: 1,
  teamSessions: [],
};

export const mockPerformance = {
  id: 1,
  name: "2024 정기공연",
  startAt: new Date("2024-12-01T18:00:00Z"),
  endAt: new Date("2024-12-01T21:00:00Z"),
};
```

---

## 9. 커버리지 목표

### 9.1 목표 커버리지

| 항목       | 목표  |
| ---------- | ----- |
| Lines      | ≥ 80% |
| Functions  | ≥ 80% |
| Branches   | ≥ 70% |
| Statements | ≥ 80% |

### 9.2 커버리지 리포트 확인

```bash
cd apps/api && pnpm test:cov
```

커버리지 리포트는 `apps/api/coverage/` 디렉토리에 생성됩니다.

---

## 10. 테스트 모범 사례

### 10.1 Arrange-Act-Assert 패턴

```typescript
describe("TeamService.apply", () => {
  it("should apply user to team session", async () => {
    // Arrange
    const teamId = 1;
    const userId = 1;
    const application = [{ sessionId: 1, index: 1 }];

    jest.spyOn(prisma.team, "findUnique").mockResolvedValue(mockTeam as any);
    jest.spyOn(prisma.teamMember, "createMany").mockResolvedValue({ count: 1 });

    // Act
    const result = await service.apply(teamId, userId, application);

    // Assert
    expect(prisma.teamMember.createMany).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
```

### 10.2 에러 케이스 테스트

```typescript
describe("error cases", () => {
  it("should throw DuplicateApplicationError on duplicate apply", async () => {
    jest.spyOn(prisma.team, "findUnique").mockResolvedValue(mockTeamWithMember);

    await expect(
      service.apply(1, 1, [{ sessionId: 1, index: 1 }]),
    ).rejects.toThrow(DuplicateApplicationError);
  });

  it("should throw PositionOccupiedError when position taken", async () => {
    // ... setup for race condition scenario
    await expect(
      service.apply(1, 2, [{ sessionId: 1, index: 1 }]),
    ).rejects.toThrow(PositionOccupiedError);
  });
});
```

### 10.3 비동기 테스트

```typescript
it("should handle async operations", async () => {
  const promise = service.create(createTeamDto);

  await expect(promise).resolves.toMatchObject({
    id: expect.any(Number),
    songName: createTeamDto.songName,
  });
});
```

---

## 11. AI 구현 체크리스트

### 11.1 단위 테스트 작성 시

- [ ] `*.spec.ts` 파일명 사용
- [ ] 소스 파일과 같은 디렉토리에 위치
- [ ] `@nestjs/testing`의 `Test.createTestingModule` 사용
- [ ] 의존성은 모두 mock 처리
- [ ] Arrange-Act-Assert 패턴 준수

### 11.2 테스트 케이스 포함 항목

- [ ] 정상 케이스 (happy path)
- [ ] 에러 케이스 (예외 발생 상황)
- [ ] 엣지 케이스 (경계값)
- [ ] 인증/권한 케이스

### 11.3 E2E 테스트 작성 시

- [ ] `test/` 디렉토리에 위치
- [ ] `*.e2e-spec.ts` 파일명 사용
- [ ] 실제 HTTP 요청으로 테스트
- [ ] 인증이 필요한 경우 토큰 획득 로직 포함

---

## 12. 관련 파일 목록

| 파일 경로                        | 역할             |
| -------------------------------- | ---------------- |
| `apps/api/package.json`          | Jest 설정 포함   |
| `apps/api/test/jest-e2e.json`    | E2E 테스트 설정  |
| `apps/api/src/**/*.spec.ts`      | 단위 테스트 파일 |
| `apps/api/test/**/*.e2e-spec.ts` | E2E 테스트 파일  |
