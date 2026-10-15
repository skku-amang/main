# 알림 시스템 구현 계획 (#347)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 팀·공연 변경을 인앱 알림함(SSOT)과 Web Push(best-effort)로 전달한다.

**Architecture:** 도메인 서비스는 커밋 뒤 도메인 이벤트(ID만)를 `@nestjs/event-emitter`로 emit하고 알림의 존재를 모른다. `NotificationListener`가 수신자·스냅샷을 해석해 `Notification` row를 fan-out 저장하고 `notification.created`를 emit한다. `PushListener`는 그 이벤트를 받아 저장된 알림에서 파생된 푸시를 `web-push`로 보낸다. web은 `type + payload`로 문구를 렌더한다.

**Tech Stack:** NestJS 11 + `@nestjs/event-emitter` 12, Prisma, nestjs-zod, `web-push` 3, Next.js 16 + TanStack Query, shadcn `dropdown-menu`, 수제 service worker.

**Spec:** [notification-system-design.md](../notification-system-design.md) (데이터 모델·이벤트·수신자·API). 채널 결정은 [ADR-0003](../../adr/0003-web-push-notification-channel.md).

## Global Constraints

- 코드 식별자는 영문 enum(`TEAM_MEMBER_CHANGE` 등), 사용자 문구는 한국어 + 용어집("지원"·"세션").
- 알림 문구는 저장하지 않는다. `type + payload` 스냅샷만 저장.
- 서비스 코드는 알림 모듈을 import하지 않는다. 의존 방향: notification → team/performance.
- 리스너 실패는 로깅만. 원본 요청 응답을 막지 않는다.
- 평문 시크릿 금지. VAPID private은 첫 커밋부터 SealedSecret.
- web·API 독립 배포: web PR은 선행 API PR이 production 승격된 뒤 머지.

## Review Focus

1. 자기 행동은 자기에게 알리지 않는다 — self-apply 시 본인 제외, 팀장이 본인을 로스터에 넣어도 본인 제외 (Task 6 리스너 테스트).
2. 남의 알림 `PATCH /notifications/:id/read`는 404, 본인 것은 두 번 호출해도 같은 결과 (Task 5 서비스 테스트).
3. 팀 수정에서 같은 세션·같은 자리 유지 멤버는 ADDED/REMOVED 아님, 세션 이동은 REMOVED+ADDED (Task 4 diff 테스트).
4. 팀 수정에서 바뀐 필드가 없으면 `TEAM_ATTRIBUTE_CHANGE`를 만들지 않는다 (Task 4 diff 테스트).
5. 푸시 응답 410/404면 해당 구독만 삭제하고 나머지 발송은 계속 (Task 11 테스트).

## PR 분할

| PR  | 브랜치                   | 범위                                                | 이슈        |
| --- | ------------------------ | --------------------------------------------------- | ----------- |
| 1   | `feat/notification-api`  | Task 1~7: 모델·이벤트·저장·조회 API                 | Refs #546   |
| 2   | `feat/notification-bell` | Task 8~9: api-client·훅·벨 UI                       | Refs #547   |
| 3   | `feat/push-api`          | Task 10~12: 구독 모델·API·PushListener·VAPID 시크릿 | Closes #546 |
| 4   | `feat/push-web`          | Task 13~15: manifest·SW·soft-ask·안내               | Closes #547 |

---

## File Structure

```
packages/database/prisma/schema.prisma                 # [수정] NotificationType, Notification, PushSubscription(PR3)
packages/shared-types/src/notification/
├── notification.schema.ts                              # [신규] payload zod 4종, NotificationItemSchema(discriminated union), 목록 쿼리
├── notification.types.ts                               # [신규] NotificationList, UnreadCount 응답 타입
├── notification.format.ts                              # [PR2] formatNotification(item) → { title, body, href }
├── notification.format.test.ts                         # [PR2]
└── push-subscription.schema.ts                         # [PR3] 구독 등록/해제 DTO
apps/api/src/team/team.events.ts                        # [신규] TEAM_EVENTS, 이벤트 클래스, diffRoster, changedTeamFields (순수 함수)
apps/api/src/team/team.events.spec.ts                   # [신규]
apps/api/src/performance/performance.events.ts          # [신규] PERFORMANCE_EVENTS, PerformanceCreatedEvent
apps/api/src/notification/
├── notification.module.ts
├── notification.controller.ts / .spec.ts
├── notification.service.ts / .spec.ts                  # 조회·읽음 (recipient 스코프)
├── notification.listener.ts / .spec.ts                 # 도메인 이벤트 → row fan-out → notification.created
├── notification.events.ts                              # NOTIFICATION_EVENTS.CREATED, NotificationCreatedEvent
└── dto/get-notifications-query.dto.ts
apps/api/src/push/                                      # [PR3]
├── push.module.ts, push.controller.ts, push.service.ts, push.listener.ts (+spec)
└── dto/
infra/k8s/api/overlays/{staging,production}/sealed-secret.yaml   # [PR3] VAPID_PRIVATE_KEY
infra/k8s/api/overlays/{staging,production}/kustomization.yaml   # [PR3] VAPID_PUBLIC_KEY, VAPID_SUBJECT
packages/api-client/src/index.ts                        # [PR2/PR3] 알림·구독 메서드
apps/web/hooks/api/useNotification.ts                   # [PR2]
apps/web/components/Header/_component/NotificationBell.tsx   # [PR2]
apps/web/components/BottomTabBar.tsx                    # [PR2] 알림 탭 추가
apps/web/app/(general)/(light)/notifications/page.tsx   # [PR2] 모바일 전체 목록
apps/web/app/manifest.ts, public/sw.js, public/icons/   # [PR4]
apps/web/components/PushSoftAsk.tsx, lib/push.ts        # [PR4]
infra/terraform/vercel/main.tf                          # [PR4] NEXT_PUBLIC_VAPID_PUBLIC_KEY
```

---

## PR1 — feat(api): 알림 저장·조회

### Task 1: Prisma 모델

**Files:** Modify `packages/database/prisma/schema.prisma` (User 역관계, enum, model). 마이그레이션 `add_notifications`.

- [x] enum `NotificationType { TEAM_MEMBER_CHANGE TEAM_ATTRIBUTE_CHANGE TEAM_CREATED PERFORMANCE_CREATED }`
- [x] model `Notification` (설계 §1 그대로: `recipientId`, `type`, `payload Json`, `readAt DateTime?`, `createdAt`, `@@index([recipientId, readAt])`, `@@map("notifications")`)
- [x] `User.notifications Notification[] @relation("notifications")`
- [x] `cd packages/database && pnpm db:migrate --name add_notifications && pnpm db:generate`
- [x] 커밋 `feat(db): 알림 테이블 추가`

### Task 2: 공유 타입

**Files:** Create `packages/shared-types/src/notification/notification.schema.ts`, `notification.types.ts`. Modify `src/index.ts`.

**Produces:**

```ts
export const TeamMemberChangePayloadSchema   // { teamId, performanceId, teamName, changeType: "ADDED"|"REMOVED", memberName, sessionNames: SessionName[] }
export const TeamAttributeChangePayloadSchema // { teamId, performanceId, teamName, changedFields: string[] }
export const TeamCreatedPayloadSchema         // { performanceId, performanceName, teamId, teamName }
export const PerformanceCreatedPayloadSchema  // { performanceId, performanceName }
export const NotificationItemSchema           // z.discriminatedUnion("type", [...4종]) + { id, readAt: Date|null, createdAt: Date }
export type NotificationItem = z.infer<typeof NotificationItemSchema>
export type NotificationPayload<T extends NotificationType> = Extract<NotificationItem, { type: T }>["payload"]
export const GetNotificationsQuerySchema      // { cursor?: number, limit: number (1..50, default 20) }
export type GetNotificationsQuery
export type NotificationList = { items: NotificationItem[]; nextCursor: number | null }
export type UnreadNotificationCount = { count: number }
```

- [x] `NotificationType`은 `@repo/database/enums`에서 import, `z.nativeEnum`. `SessionName`도 동일.
- [x] `index.ts`에 두 파일 export 추가. `pnpm --filter=@repo/shared-types build` 통과.
- [x] 커밋 `feat(types): 알림 payload·응답 스키마`

### Task 3: EventEmitter 설치

- [x] `cd apps/api && pnpm add @nestjs/event-emitter`
- [x] `app.module.ts` imports에 `EventEmitterModule.forRoot()` 추가 (ConfigModule 다음)
- [x] 커밋 `build(api): @nestjs/event-emitter 추가`

### Task 4: 도메인 이벤트 + 순수 diff 함수

**Files:** Create `apps/api/src/team/team.events.ts`, `team.events.spec.ts`, `apps/api/src/performance/performance.events.ts`.

**Produces:**

```ts
export const TEAM_EVENTS = {
  CREATED: "team.created",
  UPDATED: "team.updated",
  MEMBER_ADDED: "team.member.added",
  MEMBER_REMOVED: "team.member.removed",
} as const;
export class TeamCreatedEvent {
  constructor(
    readonly teamId: number,
    readonly actorId: number,
  ) {}
}
export class TeamUpdatedEvent {
  constructor(
    readonly teamId: number,
    readonly changedFields: string[],
    readonly actorId: number,
  ) {}
}
export class TeamMemberAddedEvent {
  constructor(
    readonly teamId: number,
    readonly userId: number,
    readonly sessionIds: number[],
    readonly actorId: number,
  ) {}
}
export class TeamMemberRemovedEvent {
  /* 동일 필드 */
}

type RosterSession = { sessionId: number; members: { userId: number }[] };
export function diffRoster(
  before: RosterSession[],
  after: RosterSession[],
): { added: Map<number, number[]>; removed: Map<number, number[]> }; // userId → sessionIds
export function changedTeamFields(
  existing: Team & { teamSessions: { sessionId: number; capacity: number }[] },
  dto: UpdateTeam,
): string[];

export const PERFORMANCE_EVENTS = { CREATED: "performance.created" } as const;
export class PerformanceCreatedEvent {
  constructor(
    readonly performanceId: number,
    readonly actorId: number,
  ) {}
}
```

- [x] `diffRoster` 테스트: 같은 (userId, sessionId) 유지 → 변화 없음 / 새 유저 → added / 빠진 유저 → removed / 세션 이동 → removed+added / index만 바뀜 → 변화 없음
- [x] `changedTeamFields` 테스트: 동일 값 → `[]` / `name` 변경 → `["name"]` / `description: undefined`→기존 null 유지 → `[]` / `performanceId` 변경 → 포함 / 세션 capacity 변경 또는 세션 추가·삭제 → `"sessions"` 포함
- [x] 비교 대상 스칼라: `name, description, image, songName, songArtist, isFreshmenFixed, isSelfMade, songYoutubeVideoUrl, leaderId, performanceId`. `undefined`/`null` 동일 취급.
- [x] 커밋 `feat(api): 팀·공연 도메인 이벤트 정의`

### Task 5: 알림 모듈 (service·controller)

**Files:** Create `apps/api/src/notification/{notification.module,notification.service,notification.controller,notification.events}.ts`, `dto/get-notifications-query.dto.ts`, specs. Modify `app.module.ts`.

**Produces:**

```ts
class NotificationService {
  findAll(recipientId: number, query: GetNotificationsQuery): Promise<NotificationList>   // orderBy id desc, cursor = id < cursor, take limit+1
  countUnread(recipientId: number): Promise<UnreadNotificationCount>
  markRead(recipientId: number, id: number): Promise<Notification>   // 남의 것/없음 → NotFoundError, 이미 읽음 → 그대로 반환
  markAllRead(recipientId: number): Promise<{ count: number }>
}
// 라우트 (AccessTokenGuard, req.user as JwtPayload → sub)
GET /notifications?cursor&limit · GET /notifications/unread-count · PATCH /notifications/read-all · PATCH /notifications/:id/read
export const NOTIFICATION_EVENTS = { CREATED: "notification.created" } as const
export class NotificationCreatedEvent { constructor(readonly recipientIds: number[], readonly type: NotificationType, readonly payload: NotificationItem["payload"]) {} }
```

- [x] service 테스트 (prisma mock): limit+1 조회로 `nextCursor` 계산 (limit=2, row 3개 → items 2, nextCursor=두 번째 id) / row ≤ limit → nextCursor null / markRead 남의 것 → NotFoundError / 읽은 것 재호출 → update 안 함 / markAllRead → `{count}`
- [x] controller 테스트: 기존 `team.controller.spec.ts` 패턴 (service mock, 라우트가 `req.user.sub`를 recipientId로 넘김)
- [x] 커밋 `feat(api): 알림 목록·읽음 API`

### Task 6: NotificationListener

**Files:** Create `apps/api/src/notification/notification.listener.ts`, `.spec.ts`. Modify `notification.module.ts` providers.

**Consumes:** Task 4 이벤트, Task 2 payload 타입.

- [x] `@OnEvent(TEAM_EVENTS.MEMBER_ADDED/REMOVED)` → team(name, performanceId, leaderId, teamSessions{sessionId, session.name, members.userId}) + user(name) 조회 → 수신자 = 팀원 ∪ 리더 − actor → `TEAM_MEMBER_CHANGE` createMany
- [x] `@OnEvent(TEAM_EVENTS.UPDATED)` → 팀원 ∪ 리더 − actor → `TEAM_ATTRIBUTE_CHANGE`
- [x] `@OnEvent(TEAM_EVENTS.CREATED)` → 공연의 모든 팀 멤버 ∪ 리더 distinct − actor → `TEAM_CREATED`
- [x] `@OnEvent(PERFORMANCE_EVENTS.CREATED)` → `user where isApproved` − actor → `PERFORMANCE_CREATED`
- [x] 수신자 0명이면 저장·emit 생략. 저장 후 `eventEmitter.emit(NOTIFICATION_EVENTS.CREATED, new NotificationCreatedEvent(...))`
- [x] 모든 핸들러는 try/catch + `Logger.error`. 예외 전파 금지.
- [x] 테스트: 팀원 [1,2,3]+리더 4, actor 1 → recipient [2,3,4] row 생성, payload 스냅샷(teamName, memberName, sessionNames enum 문자열) / actor가 유일 팀원 → 저장 없음 / 팀 없음(삭제됨) → 저장 없음·예외 없음 / 공연 두 팀에 겹치는 유저 → distinct
- [x] 커밋 `feat(api): 도메인 이벤트를 알림으로 변환하는 리스너`

### Task 7: emit 지점 삽입

**Files:** Modify `team.service.ts` (create/update/apply/unapply), `team.controller.ts` (create·update에 `@Req()` → actorId), `performance.service.ts` (create), `performance.controller.ts`, 기존 4개 spec에 `EventEmitter2` mock provider 추가.

- [x] 시그니처: `TeamService.create(dto, actorId)`, `update(id, dto, actorId)`, `PerformanceService.create(dto, actorId)`. apply/unapply는 `userId`가 actor.
- [x] `create`: `team.create` 성공 후 `emit(TEAM_EVENTS.CREATED, new TeamCreatedEvent(team.id, actorId))`
- [x] `update`: `$transaction` 전에 `changedTeamFields(existingTeam, dto)`·`diffRoster(existingTeam.teamSessions, memberSessions)` 계산, 성공 후 UPDATED(바뀐 게 있을 때만) + 유저별 MEMBER_ADDED/REMOVED emit
- [x] `apply`: createMany 성공 후 `MEMBER_ADDED(id, userId, sessionIds, userId)` 1건 (다중 세션 배칭)
- [x] `unapply`: deleteMany 성공 후 `MEMBER_REMOVED` 1건
- [x] `performance.create`: 성공 후 `PERFORMANCE_CREATED`
- [x] 테스트: `update`에서 변경 없음 → UPDATED emit 없음, 로스터 변경 → 유저별 이벤트 (team.service.spec 확장)
- [x] `pnpm lint && pnpm check-types && cd apps/api && pnpm test` 전부 통과
- [x] 설계 문서 §3 파이프라인을 리스너 체인(도메인 이벤트 → 저장 → `notification.created` → 푸시)으로 갱신
- [x] 커밋 `feat(api): 팀·공연 변경 시 알림 이벤트 발행`, PR 생성 (Refs #546)

---

## PR2 — feat(web): 알림함 벨

### Task 8: api-client + 포맷터 + 훅

**Files:** Modify `packages/api-client/src/index.ts`. Create `packages/shared-types/src/notification/notification.format.ts` (+test), `apps/web/hooks/api/useNotification.ts`.

**Produces:**

```ts
// api-client
getNotifications(query?: GetNotificationsQuery): PromiseWithError<NotificationList, AuthError | InternalServerError>
getUnreadNotificationCount(): PromiseWithError<UnreadNotificationCount, ...>
markNotificationRead(id: number): PromiseWithError<NotificationItem, NotFoundError | AuthError | InternalServerError>
markAllNotificationsRead(): PromiseWithError<{ count: number }, ...>
// shared-types
formatNotification(item: NotificationItem): { title: string; body: string; href: string }
// web hooks
NOTIFICATIONS_QUERY_KEY, UNREAD_COUNT_QUERY_KEY, useNotifications(query), useUnreadNotificationCount(), useMarkNotificationRead(), useMarkAllNotificationsRead()
```

- [x] 문구 예: `TEAM_MEMBER_CHANGE/ADDED` → title `${teamName}에 새 멤버`, body `${memberName}님이 ${세션 한글}에 지원했습니다`. 세션 한글 맵은 shared-types에 `SESSION_LABEL: Record<SessionName, string>` 신설 (web `constants/session.ts`가 이를 참조하도록 교체, 중복 제거).
- [x] href: 팀 → `/performances/${performanceId}/teams/${teamId}`, 공연 → `/performances/${performanceId}`
- [x] vitest: 4종 × 대표 1건씩 title/body/href
- [x] 커밋 `feat(api-client,types,web): 알림 조회 메서드·문구 포맷·훅`

### Task 9: 벨 UI

**Files:** Create `apps/web/components/Header/_component/NotificationBell.tsx`, `app/(general)/(light)/notifications/page.tsx`. Modify `Header/index.tsx`, `BottomTabBar.tsx`.

- [x] 데스크톱: `Profile` 왼쪽에 `Bell` 아이콘 + `Badge`(미읽음 수, 99+). `DropdownMenu`(`TeamRecruitDropdown` 패턴) 안에 최근 20건. 항목 클릭 → `markRead` + `router.push(href)`. 하단 "모두 읽음" 버튼 + "전체 보기" 링크.
- [x] 모바일: `BottomTabBar`에 "알림" 탭(`/notifications`), 뱃지. 페이지는 cursor 기반 "더 보기".
- [x] 로그인 안 했으면 벨·탭 숨김. `unread-count`는 `refetchOnWindowFocus`, staleTime 30초.
- [x] 읽음 처리 후 `invalidateQueries([NOTIFICATIONS_QUERY_KEY, UNREAD_COUNT_QUERY_KEY])`
- [x] `/fe-qa`로 데스크톱·모바일 검증, 스크린샷 PR 본문 임베드
- [x] 커밋 `feat(web): 헤더·탭바 알림함`, PR 생성 (Refs #547). PR1 production 승격 확인 후 머지.

---

## PR3 — feat(api,infra): Web Push 발송

### Task 10: PushSubscription 모델 + 구독 API

- [x] Prisma `PushSubscription` (설계 §1), `User.pushSubscriptions`, 마이그레이션 `add_push_subscriptions`
- [x] shared-types `push-subscription.schema.ts`: `CreatePushSubscriptionSchema { endpoint: url, p256dh, auth }`, `DeletePushSubscriptionSchema { endpoint }`
- [x] `apps/api/src/push/`: `POST /push/subscriptions` (upsert by endpoint, userId 갱신), `DELETE /push/subscriptions` (본인 것만). 테스트: 같은 endpoint 재등록 → row 1개 / 남의 endpoint 삭제 → 영향 0
- [x] 커밋 `feat(api,db,types): 푸시 구독 등록·해제 API`

### Task 11: PushListener

- [x] `pnpm add web-push` + `@types/web-push`
- [x] env: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`(mailto:) — `env.schema.ts` 필수 추가, `.env.example` 갱신, `scripts/setup.sh`에 `npx web-push generate-vapid-keys` 안내 주석
- [x] `PushService.sendToUsers(recipientIds, { title, body, href })`: 구독 조회 → `webpush.sendNotification` 병렬(`Promise.allSettled`) → `WebPushError.statusCode ∈ {404, 410}` → 해당 구독 삭제, 그 외 실패 → warn 로그
- [x] `PushListener @OnEvent(NOTIFICATION_EVENTS.CREATED)` → `formatNotification` → `sendToUsers`
- [x] 테스트 (web-push mock): 구독 3개 중 1개 410 → 그 구독만 삭제, 나머지 2개 발송 / 구독 없음 → 호출 0
- [x] 커밋 `feat(api): 알림 생성 시 Web Push 발송`

### Task 12: VAPID 시크릿

- [x] 키 2쌍 생성(staging·production 별도). `KUBECONFIG=~/.kube/config-json kubeseal --raw --namespace=amang-api-<env> --name=api-secrets`로 `VAPID_PRIVATE_KEY` 봉인 → 두 overlay `sealed-secret.yaml`에 추가
- [x] 두 overlay `kustomization.yaml` configMapGenerator에 `VAPID_PUBLIC_KEY`, `VAPID_SUBJECT=mailto:amang.skku@gmail.com`(실제 주소 확인)
- [x] `infra/AGENTS.md` 시크릿 목록 갱신
- [x] PR 생성 (Closes #546). 머지 후 staging ArgoCD sync·API 기동 확인(env 검증 통과)

---

## PR4 — feat(web): 푸시 구독 플로우

### Task 13: manifest + SW

- [x] `apps/web/app/manifest.ts`: name AMANG, `display: "standalone"`, `start_url: "/"`, theme/background, icons 192·512 (`public/icons/`, Logo.png에서 생성). `layout.tsx` metadata에 `appleWebApp: { capable: true, title: "AMANG" }`, `icons.apple`
- [x] `public/sw.js`: `push` → `showNotification(title, { body, data: { href }, icon })`, `notificationclick` → 열린 창 focus 또는 `openWindow(href)`, `pushsubscriptionchange` → 재구독 후 `POST /push/subscriptions`
- [x] 커밋 `feat(web): PWA manifest와 푸시 service worker`

### Task 14: soft-ask + 구독

- [x] api-client: `createPushSubscription(body)`, `deletePushSubscription(body)`
- [x] `lib/push.ts`: `registerServiceWorker()`, `subscribePush(vapidPublicKey)`(urlBase64ToUint8Array), `getPushState(): "unsupported" | "ios-not-installed" | "in-app-browser" | "denied" | "granted" | "default"`
- [x] `PushSoftAsk.tsx`: 로그인 + state=default일 때 하단 배너. "알림 받기" → `Notification.requestPermission()`(사용자 제스처 안) → 구독 → 서버 등록. "나중에" → localStorage 7일 스누즈. ios-not-installed → "홈 화면에 추가" 안내(공유 아이콘 설명). in-app-browser(UA `KAKAOTALK|Instagram|FBAN`) → "Safari/Chrome으로 열기" 안내
- [x] 프로필 > 기기 페이지에 "이 기기 푸시 해제" 토글
- [x] Terraform `vercel_project_environment_variable` `NEXT_PUBLIC_VAPID_PUBLIC_KEY` production·preview(값 = PR3 공개키), `env.d.ts` 타입 추가
- [x] 커밋 `feat(web,infra): 푸시 권한 soft-ask와 구독 등록`

### Task 15: QA

- [ ] `/fe-qa`: 데스크톱 Chrome 구독 → 다른 계정으로 팀 지원 → 푸시 수신·클릭 딥링크 확인(로컬 localhost HTTPS 예외)
- [x] PR 생성 (Closes #547). 스테이징 수동 QA 체크리스트를 PR 본문에 포함
