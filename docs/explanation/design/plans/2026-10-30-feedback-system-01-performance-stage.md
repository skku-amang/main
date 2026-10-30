# 피드백 시스템 1/6 — 공연 진행 단계 구현 계획 (#892)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 공연에 날짜 필드를 넣고, 단계(7개)를 날짜에서 계산해 팀 생성·지원·수정을 단계에 따라 열고 잠근다.

**Architecture:** 단계는 저장하지 않는다. `@repo/shared-types`의 `getPerformanceStage(dates, now)` 하나를 서버(team.service 잠금, reminder, 목록 where)와 웹(배지, 버튼 노출, 목록 분리)이 같이 쓴다. 지금 `Performance.endAt`이 겸하던 "모집 마감"을 `recruitEndAt`으로 옮기고, `isPerformanceRecruiting`은 `stage === "RECRUITING"`의 얇은 래퍼로 남겨 호출처 교체를 한 PR에 담는다. 마이그레이션이 옛 공연에 `recruitStartAt = createdAt`, `recruitEndAt = endAt`을 채워 현재 동작을 보존한다.

**Tech Stack:** Prisma(마이그레이션 + 백필 SQL), Zod(`superRefine`), NestJS 11 + Jest, Next.js 16 + shadcn `badge`, vitest(shared-types).

**Spec:** [feedback-system-design.md](../feedback-system-design.md) 4절(단계·날짜·수동 개입·소속자·잠금·고정팀 권한). 요구사항 배경은 [feedback-system-requirements.md](../feedback-system-requirements.md) R6·R8, D5·D6.

## Global Constraints

- 단계 코드는 영문 `PREPARING | RECRUITING | SUBMISSION | EVALUATION | DECISION | LINEUP | DONE`, 사용자 문구는 한국어 `준비 | 팀 모집 | 제출 | 피드백 | 집계 | 공연 준비 | 종료`.
- 단계를 저장하는 컬럼·cron·이력 테이블을 만들지 않는다. 수동 개입 = 날짜 수정.
- 날짜가 비어 있으면 그 단계로 못 넘어간다. 단 `endAt`이 지나면 무조건 `DONE`.
- `recruitEndAt == feedbackStartAt`이면 `SUBMISSION`을 건너뛴다.
- `isPerformanceRecruiting`·`recruitingPerformanceWhere`·`getRecruitDaysLeft`·`splitPerformances`의 호출처 전부를 이 PR에서 교체한다. 기준은 `recruitEndAt`.
- `decidedAt`은 이 PR에서 스키마에만 추가한다. 쓰는 API는 #896.
- `isFreshmenFixed`는 운영진만 바꿀 수 있다 (서버 거부 + 팀 폼에서 체커 제거). 기존 값 유지.
- 팀 수정 잠금: `RECRUITING`만 사람(멤버·정원·팀장·탈퇴·삭제) 변경 가능, `SUBMISSION`까지 내용(곡 정보·이름·설명·사진·자작곡) 변경 가능, `EVALUATION`부터 전부 잠금. 팀 생성·지원은 `RECRUITING`만.
- 커밋·PR은 [CONTRIBUTING.md](../../../../CONTRIBUTING.md) 컨벤션. 워크트리 `~/amang-worktrees/performance-stage`, 브랜치 `feat/performance-stage`.
- 배포: 새 컬럼은 전부 nullable/default라 옛 API 파드가 돌아가는 동안 마이그레이션해도 안전. api·web이 같은 커밋으로 한 Freight에 묶이므로 PR 하나로 간다.

## Review Focus

1. 날짜를 하나도 안 넣은 새 공연 → `PREPARING`, 팀 생성 시 "팀 모집 기간이 아닙니다." (Task 1·3)
2. `recruitEndAt == feedbackStartAt` → `SUBMISSION` 없이 바로 `EVALUATION` (Task 1)
3. `endAt`은 지났는데 `decidedAt` 없는 옛 공연 → `DONE`, 팀 수정·삭제 전부 거부 (Task 1·3)
4. 운영진이 `feedbackStartAt`을 미래로 미루면 `EVALUATION`이던 공연이 `SUBMISSION`으로 돌아가고 내용 수정이 다시 열린다 — 잠금 판정은 요청마다 날짜로 계산, 캐시 없음 (Task 3)
5. PATCH로 날짜 하나만 보내 순서가 깨짐(`feedbackStartAt < 기존 recruitEndAt`) → 서버가 기존 값과 합쳐 검증해 거부 (Task 2)

---

### Task 1: shared-types — 단계 계산·일정 검증·잠금 판정

**Files:**

- Modify: `packages/shared-types/src/performance/performance.types.ts:48-61` (`isPerformanceRecruiting`, `recruitingPerformanceWhere` 교체)
- Modify: `packages/shared-types/src/performance/performance.schema.ts` (새 필드, `validatePerformanceSchedule`, `dateValidationRefine` 대체)
- Modify: `packages/shared-types/src/performance/create-performance.schema.ts`, `update-performance.schema.ts` (`.refine(dateValidationRefine, …)` → `.superRefine(scheduleRefine)`)
- Test: `packages/shared-types/src/performance/performance.types.test.ts`

**Interfaces (Produces):**

```ts
export const PERFORMANCE_STAGES = [
  "PREPARING",
  "RECRUITING",
  "SUBMISSION",
  "EVALUATION",
  "DECISION",
  "LINEUP",
  "DONE",
] as const;
export type PerformanceStage = (typeof PERFORMANCE_STAGES)[number];
export const PERFORMANCE_STAGE_LABEL: Record<PerformanceStage, string>; // 준비·팀 모집·제출·피드백·집계·공연 준비·종료
export type PerformanceSchedule = Pick<
  Performance,
  | "recruitStartAt"
  | "recruitEndAt"
  | "feedbackStartAt"
  | "feedbackEndAt"
  | "decidedAt"
  | "endAt"
>;
export const getPerformanceStage: (
  p: PerformanceSchedule,
  now?: Date,
) => PerformanceStage;
export const isPerformanceRecruiting: (
  p: PerformanceSchedule,
  now?: Date,
) => boolean; // stage === "RECRUITING"
export const isTeamRosterOpen: (stage: PerformanceStage) => boolean; // RECRUITING
export const isTeamContentOpen: (stage: PerformanceStage) => boolean; // RECRUITING | SUBMISSION
export const recruitingPerformanceWhere: (
  now?: Date,
) => Prisma.PerformanceWhereInput; // getPerformanceStage === RECRUITING과 같은 집합
// performance.schema.ts
export const validatePerformanceSchedule: (
  d: Partial<
    Record<
      | "startAt"
      | "endAt"
      | "recruitStartAt"
      | "recruitEndAt"
      | "feedbackStartAt"
      | "feedbackEndAt",
      Date | null | undefined
    >
  >,
) => string | null;
export const scheduleRefine: (d, ctx: z.RefinementCtx) => void; // validatePerformanceSchedule 결과를 ctx.addIssue
```

- [ ] **Step 0: Prisma 타입 먼저** — `packages/database/prisma/schema.prisma:123-139` `Performance`에 `recruitStartAt DateTime?`, `recruitEndAt DateTime?`, `feedbackStartAt DateTime?`, `feedbackEndAt DateTime?`, `decidedAt DateTime?`, `passCount Int?`, `penaltyPerMissingReview Float @default(0)` 추가 (주석: 모집 시작/종료, 피드백 시작/종료, 운영진 확정, 합격 곡 수, 미참여 1건당 감점). `cd packages/database && pnpm db:generate`. 마이그레이션 파일은 Task 2에서 만든다 — 여기선 타입만.

- [ ] **Step 1: 실패하는 테스트 작성** — `performance.types.test.ts`의 `isPerformanceRecruiting` 블록을 아래로 교체·확장

```ts
const base = {
  recruitStartAt: null,
  recruitEndAt: null,
  feedbackStartAt: null,
  feedbackEndAt: null,
  decidedAt: null,
  endAt: null,
};
const d = (s: string) => new Date(s);
const now = d("2026-10-11T12:00:00Z");

describe("getPerformanceStage", () => {
  it("날짜가 전부 비면 PREPARING", () =>
    expect(getPerformanceStage(base, now)).toBe("PREPARING"));
  it("모집 시작만 지났으면 RECRUITING", () =>
    expect(
      getPerformanceStage(
        { ...base, recruitStartAt: d("2026-10-01T00:00:00Z") },
        now,
      ),
    ).toBe("RECRUITING"));
  it("모집 종료 지남 + 피드백 시작 전 = SUBMISSION", () =>
    expect(
      getPerformanceStage(
        {
          ...base,
          recruitStartAt: d("2026-10-01T00:00:00Z"),
          recruitEndAt: d("2026-10-10T00:00:00Z"),
          feedbackStartAt: d("2026-10-20T00:00:00Z"),
        },
        now,
      ),
    ).toBe("SUBMISSION"));
  it("모집 종료 == 피드백 시작이면 SUBMISSION 건너뜀", () =>
    expect(
      getPerformanceStage(
        {
          ...base,
          recruitStartAt: d("2026-10-01T00:00:00Z"),
          recruitEndAt: d("2026-10-10T00:00:00Z"),
          feedbackStartAt: d("2026-10-10T00:00:00Z"),
        },
        now,
      ),
    ).toBe("EVALUATION"));
  it("피드백 종료 지남 + 미확정 = DECISION", () =>
    expect(
      getPerformanceStage(
        {
          ...base,
          recruitStartAt: d("2026-09-01T00:00:00Z"),
          recruitEndAt: d("2026-09-10T00:00:00Z"),
          feedbackStartAt: d("2026-09-20T00:00:00Z"),
          feedbackEndAt: d("2026-10-01T00:00:00Z"),
        },
        now,
      ),
    ).toBe("DECISION"));
  it("확정되면 LINEUP", () =>
    expect(
      getPerformanceStage(
        { ...base, decidedAt: d("2026-10-05T00:00:00Z") },
        now,
      ),
    ).toBe("LINEUP"));
  it("공연 종료가 지나면 다른 날짜와 무관하게 DONE", () =>
    expect(
      getPerformanceStage(
        {
          ...base,
          recruitStartAt: d("2026-10-01T00:00:00Z"),
          endAt: d("2026-10-10T00:00:00Z"),
        },
        now,
      ),
    ).toBe("DONE"));
  it("모집 종료가 비어 있으면 RECRUITING 유지 (옛 공연 endAt null)", () =>
    expect(
      getPerformanceStage(
        { ...base, recruitStartAt: d("2026-10-01T00:00:00Z") },
        now,
      ),
    ).toBe("RECRUITING"));
  it("경계: now == recruitEndAt이면 이미 SUBMISSION", () =>
    expect(
      getPerformanceStage(
        {
          ...base,
          recruitStartAt: d("2026-10-01T00:00:00Z"),
          recruitEndAt: now,
        },
        now,
      ),
    ).toBe("SUBMISSION"));
});
describe("isPerformanceRecruiting", () => {
  /* RECRUITING일 때만 true — 위 케이스 중 2개 */
});
describe("isTeamRosterOpen / isTeamContentOpen", () => {
  it.each(PERFORMANCE_STAGES)("%s", (s) => {
    expect(isTeamRosterOpen(s)).toBe(s === "RECRUITING");
    expect(isTeamContentOpen(s)).toBe(s === "RECRUITING" || s === "SUBMISSION");
  });
});
describe("validatePerformanceSchedule", () => {
  it("순서가 맞으면 null", () =>
    expect(
      validatePerformanceSchedule({
        recruitStartAt: d("2026-10-01"),
        recruitEndAt: d("2026-10-10"),
        feedbackStartAt: d("2026-10-10"),
        feedbackEndAt: d("2026-10-20"),
        startAt: d("2026-11-01"),
        endAt: d("2026-11-01"),
      }),
    ).toBeNull());
  it("피드백 시작이 모집 종료보다 앞이면 메시지", () =>
    expect(
      validatePerformanceSchedule({
        recruitEndAt: d("2026-10-10"),
        feedbackStartAt: d("2026-10-09"),
      }),
    ).toBe("피드백 시작 일시는 모집 종료 일시보다 이후여야 합니다."));
  it("비어 있는 필드는 건너뛴다", () =>
    expect(
      validatePerformanceSchedule({
        recruitStartAt: d("2026-10-01"),
        feedbackEndAt: d("2026-09-01"),
      }),
    ).toBe("피드백 종료 일시는 모집 시작 일시보다 이후여야 합니다."));
  it("공연 종료가 시작보다 앞이면 기존 메시지", () =>
    expect(
      validatePerformanceSchedule({
        startAt: d("2026-11-02"),
        endAt: d("2026-11-01"),
      }),
    ).toBe("종료 일시는 시작 일시보다 이후여야 합니다."));
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @repo/shared-types test` → Expected: FAIL (`getPerformanceStage is not exported`)

- [ ] **Step 3: 구현** — `performance.types.ts`에 Interfaces대로. `getPerformanceStage`는 스펙 4.2의 순서(DONE → LINEUP → DECISION → EVALUATION → SUBMISSION → RECRUITING → PREPARING)를 그대로 `if` 사슬로. `recruitingPerformanceWhere(now)`는 `recruitStartAt <= now`, `recruitEndAt null | > now`, `feedbackStartAt null | > now`, `feedbackEndAt null | > now`, `decidedAt null`, `endAt null | > now`의 AND. `validatePerformanceSchedule`은 `["recruitStartAt","recruitEndAt","feedbackStartAt","feedbackEndAt"]` 순서로 **비어 있지 않은 것들만** 모아 인접 쌍이 `>=`인지 보고(같음 허용), 깨지면 `"{뒤 라벨} 일시는 {앞 라벨} 일시보다 이후여야 합니다."`를 반환. 라벨: 모집 시작·모집 종료·피드백 시작·피드백 종료. `startAt`/`endAt` 쌍은 기존 메시지. `PerformanceObjectSchema`에 `recruitStartAt`·`recruitEndAt`·`feedbackStartAt`·`feedbackEndAt: z.coerce.date().nullable().optional()`, `passCount: z.number().int().positive().nullable().optional()`, `penaltyPerMissingReview: z.number().min(0).optional()` 추가. `dateValidationRefine`은 삭제하고 두 스키마 파일의 `.refine(...)`을 `.superRefine(scheduleRefine)`으로.

- [ ] **Step 4: 통과 확인** — Run: `pnpm --filter @repo/shared-types test` → Expected: PASS. 이어서 `pnpm check-types` → 에러 0.

- [ ] **Step 5: Commit** — `feat(shared-types): 공연 일정 필드와 단계 계산·일정 검증·팀 잠금 판정` (schema.prisma 변경 포함)

---

### Task 2: DB·API — 스키마, 마이그레이션 백필, 공연 수정 검증

**Files:**

- Create: `packages/database/prisma/migrations/20261030120000_add_performance_schedule/migration.sql` (스키마 필드는 Task 1 Step 0에서 추가됨)
- Modify: `apps/api/src/performance/performance.service.ts:42-54` (`findAll`), `:79-100` (`update` 검증)
- Test: `apps/api/src/performance/performance.service.spec.ts`

**Interfaces:**

- Consumes: Task 1의 `validatePerformanceSchedule`, `recruitingPerformanceWhere`
- Produces: `Performance`에 `recruitStartAt DateTime?`, `recruitEndAt DateTime?`, `feedbackStartAt DateTime?`, `feedbackEndAt DateTime?`, `decidedAt DateTime?`, `passCount Int?`, `penaltyPerMissingReview Float @default(0)`

- [ ] **Step 1: 마이그레이션** — `cd packages/database && pnpm db:migrate --name add_performance_schedule`로 SQL 생성 후 `migration.sql` 끝에 백필 추가:

```sql
UPDATE "performances" SET "recruitStartAt" = "createdAt", "recruitEndAt" = "endAt";
```

로컬 DB에 적용됐는지 `pnpm db:deploy`가 "No pending migrations"인지로 확인.

- [ ] **Step 2: 실패하는 테스트** — `performance.service.spec.ts`에 추가

```ts
it("날짜 하나만 바꿔도 기존 값과 합쳐 순서를 검증한다", async () => {
  prisma.performance.findUnique.mockResolvedValue({
    ...perf,
    recruitEndAt: new Date("2026-10-10T00:00:00Z"),
  });
  await expect(
    service.update(
      1,
      { feedbackStartAt: new Date("2026-10-09T00:00:00Z") },
      adminId,
    ),
  ).rejects.toBeInstanceOf(InvalidPerformanceDateError);
});
it("status=recruiting은 recruitingPerformanceWhere를 쓴다", async () => {
  await service.findAll("recruiting");
  expect(prisma.performance.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: recruitingPerformanceWhere(expect.any(Date)),
    }),
  );
});
```

두 번째는 where 객체 비교가 `now` 때문에 깨지면 `findAll(status, now = new Date())`로 `now`를 주입받게 바꾸고 고정 날짜로 비교한다.

- [ ] **Step 3: 실패 확인** — Run: `cd apps/api && pnpm test -- performance.service` → Expected: FAIL

- [ ] **Step 4: 구현** — `update`: 기존 `startAt`/`endAt` 수동 비교를 지우고, 6개 날짜를 `dto[k] === undefined ? performance[k] : dto[k]`로 합친 뒤 `validatePerformanceSchedule(merged)`가 메시지를 주면 `throw new InvalidPerformanceDateError(message)`. `findAll`: `orderBy`를 `[{ recruitEndAt: { sort: "asc", nulls: "last" } }, { id: "asc" }]`로.

- [ ] **Step 5: 통과 확인** — Run: `cd apps/api && pnpm test -- performance` → PASS

- [ ] **Step 6: Commit** — `feat(api): 공연 일정 필드 추가·백필, 부분 수정도 일정 순서 검증`

---

### Task 3: API — 팀 생성·지원·수정·삭제를 단계로 잠금, 고정팀 운영진 전용

**Files:**

- Modify: `apps/api/src/team/team.service.ts:68-75` (create), `:197-232` (update), `:397-400` (remove), `:426-440` (apply), `:524-545` (unapply), `:594-605` (`assertPerformanceRecruiting` 교체)
- Test: `apps/api/src/team/team.service.spec.ts`

**Interfaces:**

- Consumes: Task 1의 `getPerformanceStage`, `isTeamRosterOpen`, `isTeamContentOpen`; `@repo/api-client`의 `PerformanceRecruitmentClosedError`, `ForbiddenError`
- Produces (private): `getStage(performanceId: number): Promise<PerformanceStage>` — `performance.findUnique({ select: PerformanceSchedule 6필드 })`

- [ ] **Step 1: 실패하는 테스트** — 기존 "종료 일시가 지난 공연" 케이스들을 단계 기준으로 바꾸고 추가. 픽스처: `stageDates(stage)` 헬퍼로 각 단계가 되는 날짜 세트를 만든다 (now 기준 과거/미래 조합).

```ts
describe("단계별 잠금", () => {
  it("SUBMISSION에서 팀 생성은 거부", () => expect(service.create(dto, uid)).rejects.toMatchObject({ detail: "팀 모집 기간이 아닙니다." }))
  it("SUBMISSION에서 지원·탈퇴는 거부", …"팀 모집 기간이 아니라 지원·탈퇴할 수 없습니다.")
  it("SUBMISSION에서 멤버 변경·정원·팀장 교체는 거부, 곡 정보·이름·설명·사진은 허용", …"모집이 끝나 팀 구성(멤버·정원·팀장)은 바꿀 수 없습니다.")
  it("EVALUATION부터는 어떤 수정도 거부", …"피드백 단계부터는 팀을 수정할 수 없습니다.")
  it("endAt이 지난 옛 공연(DONE)은 삭제 거부", …"모집이 끝난 팀은 삭제할 수 없습니다.")
  it("같은 팀이라도 날짜를 미래로 미루면 다시 수정 가능 (캐시 없음)", …) // findUnique mock을 두 번 다르게
  it("비운영진이 isFreshmenFixed를 바꾸면 ForbiddenError", …"신입고정팀 설정은 운영진만 바꿀 수 있습니다.")
  it("운영진은 isFreshmenFixed를 바꿀 수 있다", …)
})
```

- [ ] **Step 2: 실패 확인** — Run: `cd apps/api && pnpm test -- team.service` → FAIL

- [ ] **Step 3: 구현** — `assertPerformanceRecruiting` → `getStage` + 세 단언으로 교체. `create`·`apply`·`unapply`: `isTeamRosterOpen(stage)` 아니면 `PerformanceRecruitmentClosedError(위 문구)`. `update`: 먼저 `isTeamContentOpen` 아니면 "피드백 단계부터…"; 다음 `rosterChanged`(= `diffRoster` 결과에 변화가 있거나, `leaderId !== existingTeam.leaderId`, 또는 sessionId별 `capacity`가 달라짐, 또는 세션 추가/삭제)이고 `!isTeamRosterOpen` 이면 "모집이 끝나…"; 공연 이동(`performanceId` 변경)은 기존처럼 **대상** 공연이 RECRUITING이어야 함. `isFreshmenFixed`가 `existingTeam`과 다르면 `prisma.user.findUnique({ where: { id: actorId }, select: { isAdmin: true } })`로 확인, 아니면 `ForbiddenError`. `remove`: `isTeamRosterOpen` 아니면 거부. 잠금 판정은 매 요청 DB에서 날짜를 읽어 계산한다 (캐시 금지).

- [ ] **Step 4: 통과 확인** — Run: `cd apps/api && pnpm test` → 전체 PASS (team.events·controller spec 포함)

- [ ] **Step 5: Commit** — `feat(api): 팀 생성·지원·수정·삭제를 공연 단계로 잠금, 신입고정팀은 운영진만`

---

### Task 4: API — 모집 마감 알림 기준을 recruitEndAt으로

**Files:**

- Modify: `apps/api/src/reminder/reminder.service.ts:33-40`
- Test: `apps/api/src/reminder/reminder.service.spec.ts:20-70` (`Performance.endAt` → `recruitEndAt`)

- [ ] **Step 1: 테스트 수정** — 픽스처·where 모킹의 `endAt`을 `recruitEndAt`으로. 새 케이스: `recruitEndAt`은 내일이지만 `endAt`은 어제인 공연은 알림 대상이 아니다 (DONE).
- [ ] **Step 2: 실패 확인** — Run: `cd apps/api && pnpm test -- reminder.service` → FAIL
- [ ] **Step 3: 구현** — `where.Performance`를 `{ recruitEndAt: { gt, lte }, OR: [{ endAt: null }, { endAt: { gt: now } }] }`로. 주석의 "지원 가능 조건이 endAt > now"도 `recruitEndAt`으로.
- [ ] **Step 4: 통과 확인** — Run: `cd apps/api && pnpm test -- reminder` → PASS
- [ ] **Step 5: Commit** — `fix(api): 모집 마감 D-1 알림 기준을 모집 종료 일시로`

---

### Task 5: web — 단계 배지, 목록 분리, 버튼 노출, 팀 폼 고정팀 체커 제거

**Files:**

- Modify: `apps/web/lib/performance.ts`
- Create: `apps/web/components/PerformanceStageBadge.tsx` — `({ stage }: { stage: PerformanceStage })`, shadcn `Badge`(`@/components/ui/badge`, 없으면 `pnpm dlx shadcn@latest add badge`), 문구 `PERFORMANCE_STAGE_LABEL[stage]`
- Modify: `apps/web/app/(general)/(light)/performances/_components/PerformanceListClient.tsx:86-110`, `PerformanceCard.tsx:67`
- Modify: `apps/web/app/(home)/_components/HomeDashboard.tsx:114,197`
- Modify: `apps/web/app/(general)/(dark)/performances/[id]/teams/create/page.tsx:33` (문구 "팀 모집 기간이 아닙니다")
- Modify: `apps/web/app/(general)/(light)/performances/[id]/teams/_components/TeamListTable/data-table.tsx:110`
- Modify: `apps/web/app/(admin)/admin/teams/page.tsx:52-56` (`(마감)` → `(${PERFORMANCE_STAGE_LABEL[stage]})`)
- Modify: `apps/web/app/(general)/(dark)/performances/[id]/teams/_components/TeamForm/FirstPage/index.tsx:68,142` (래퍼 그대로 동작 확인), `:195-210` (`isFreshmenFixed` 체커 블록 삭제. 폼 기본값 `false`는 스키마 default가 채움)
- Modify: `apps/web/app/(general)/(light)/performances/[id]/_components/*` 공연 상세 헤더에 배지 1개

**Interfaces (Produces):**

```ts
// apps/web/lib/performance.ts
export const getRecruitDaysLeft: ({
  recruitEndAt,
}: Pick<Performance, "recruitEndAt">) => number | undefined;
export const splitPerformances: <
  T extends PerformanceSchedule & Pick<Performance, "startAt">,
>(
  ps: T[],
  now?: Date,
) => { recruiting: T[]; ongoing: T[]; past: T[] };
// recruiting = RECRUITING (recruitEndAt 임박순), ongoing = PREPARING·SUBMISSION·EVALUATION·DECISION·LINEUP (startAt 가까운 순), past = DONE (startAt 최근순)
```

- [ ] **Step 1: 구현** — 위 파일들. `PerformanceListClient`는 섹션 3개("모집 중" / "진행 중" / "지난 공연"), `ongoing` 카드에 `PerformanceStageBadge`. `PerformanceCard`의 D-day는 `recruiting`일 때만. 지금 `isPerformanceRecruiting(p)`를 부르는 곳은 `p`가 전체 `Performance`이면 그대로 두고, `Pick<…, "endAt">`처럼 좁혀 받는 곳만 `PerformanceSchedule`로 넓힌다.
- [ ] **Step 2: 타입·린트** — Run: `npx tsc -p apps/web --noEmit && pnpm lint --filter=web` → 에러 0 (web 타입 검사는 `check-types --filter=web`이 안 잡으므로 `tsc -p apps/web`로)
- [ ] **Step 3: 눈으로 확인** — `pnpm dev --filter=web --filter=api`(포트 점유 중이면 3100/8100). 공연 목록에 섹션 3개·배지, 팀 만들기 페이지가 `SUBMISSION` 공연에서 "팀 모집 기간이 아닙니다", 팀 폼에 고정팀 체커 없음. 스크린샷은 `.tmp/screenshots/`.
- [ ] **Step 4: Commit** — `feat(web): 공연 단계 배지·진행 중 섹션, 모집 기간 밖 팀 생성·지원 차단, 고정팀 체커 제거`

---

### Task 6: web 운영진 — 공연 폼에 일정 필드·합격 곡 수·감점·"지금으로"

**Files:**

- Modify: `apps/web/app/(admin)/admin/performances/_components/PerformanceFormDialog.tsx:30-110,131-180`
- Modify: `apps/web/app/(admin)/admin/performances/_components/columns.tsx` (단계 열 1개: `PerformanceStageBadge`)

- [ ] **Step 1: 구현** — 로컬 zod 스키마·기본값·`toDatetimeLocal` 변환에 `recruitStartAt`·`recruitEndAt`·`feedbackStartAt`·`feedbackEndAt`(datetime-local, nullable), `passCount`(정수, 빈칸 → null), `penaltyPerMissingReview`(소수, 기본 0) 추가. 날짜 필드 4개 옆에 "지금으로" 버튼 → `toDatetimeLocal(new Date())`. 폼 하단에 미리보기 한 줄: `지금 저장하면 단계: {PERFORMANCE_STAGE_LABEL[getPerformanceStage(parsed)]}` (폼 값을 Date로 파싱해 계산, `decidedAt`은 편집 중 공연의 값). 서버 검증 메시지(`InvalidPerformanceDateError`)는 기존 에러 표시 경로로 노출.
- [ ] **Step 2: 타입·린트** — Run: `npx tsc -p apps/web --noEmit && pnpm lint --filter=web` → 0
- [ ] **Step 3: 눈으로 확인** — 운영진으로 공연 생성: 날짜 없이 저장 → 목록 단계 "준비"; 모집 시작 "지금으로" → "팀 모집"; 모집 종료 "지금으로" → "제출"; 피드백 시작을 모집 종료보다 앞으로 → 저장 거부 메시지. 그 상태에서 일반 계정으로 팀 만들기 → 차단 문구.
- [ ] **Step 4: Commit** — `feat(web): 운영진 공연 폼에 모집·피드백 일정, 합격 곡 수, 감점, 단계 미리보기`

---

### Task 7: 마무리 — 전체 검증, PR

- [ ] **Step 1: 전체 검사** — Run: `pnpm --filter @repo/shared-types test && (cd apps/api && pnpm test) && pnpm lint && npx tsc -p apps/web --noEmit && pnpm build --filter=api` → 전부 0/PASS
- [ ] **Step 2: 마이그레이션 백필 확인** — 로컬 DB에서 `SELECT id, "recruitStartAt" = "createdAt" AS s, "recruitEndAt" IS NOT DISTINCT FROM "endAt" AS e FROM performances;` → 전 행 `s = true`, `e = true`
- [ ] **Step 3: 문서** — 용어집 라이프사이클 절은 #903에서 갱신됨. 이 PR에선 [glossary.md](../../../reference/glossary.md) `Performance` 항목의 schema 줄 범위 링크만 새 줄 번호로 맞춘다.
- [ ] **Step 4: PR** — 제목 `feat: 공연 진행 단계 — 날짜에서 계산, 모집·제출 단계별 팀 잠금`, 본문 `Closes skku-amang/main#892`, 설계 링크, 스크린샷은 `gh --attach`. 머지 전 main 이미지 빌드 워크플로 확인. 로컬 서버는 머지 뒤에 내린다.
