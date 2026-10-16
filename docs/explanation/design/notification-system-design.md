# 알림 시스템 구현 설계 (#347)

본 문서는 알림 시스템의 **구현 설계 SSOT**. 제품 결정·채널 결정은 아래 상위 문서가 SSOT이며, 본 문서는 그것들이 구현에 위임한 빈칸(데이터 모델·이벤트 매핑·수신자 해석)을 확정한다.

- 상태: 구현 완료 (PR #724·#727·#733·#734), 스테이징 QA 대기
- 상위: [#347](https://github.com/skku-amang/main/issues/347) 알림 시스템(무엇), [ADR-0003](../adr/0003-web-push-notification-channel.md) 모바일 채널(Web Push)
- 하위 작업: [#546](https://github.com/skku-amang/main/issues/546) 백엔드(저장·조회·발송), [#547](https://github.com/skku-amang/main/issues/547) web(구독·알림함 UI)
- 범위 밖 연결: 이메일/SMS(ADR-0003에서 분리), 비밀번호 찾기 인증 메일([#528](https://github.com/skku-amang/main/issues/528))

## 0. 문서 경계

| 결정                                               | SSOT                                                 |
| -------------------------------------------------- | ---------------------------------------------------- |
| 어떤 이벤트를, 누구에게                            | #347 (이벤트 표)                                     |
| 모바일 도달 채널 = Web Push                        | ADR-0003                                             |
| 백엔드 요구(저장·구독·발송)                        | #546                                                 |
| web 요구(SW·soft-ask·알림함)                       | #547                                                 |
| **데이터 모델·payload·emit 지점·수신자 해석 로직** | **본 문서** (#546이 "모델링은 백엔드 재량"으로 위임) |

## 1. 데이터 모델

`packages/database/prisma/schema.prisma`.

```prisma
enum NotificationType {
  TEAM_MEMBER_CHANGE     // 팀 멤버 추가/제거
  TEAM_ATTRIBUTE_CHANGE  // 팀 곡명/세션 등 변경
  TEAM_CREATED           // 공연에 새 팀 생성
  PERFORMANCE_CREATED    // 새 공연 생성
  PERFORMANCE_UPDATED    // 공연 일정·장소·이름 변경 (2026-10-16 추가)
  TEAM_DELETED           // 팀 삭제
  TEAM_LEADER_CHANGED    // 팀장 교체 (새 팀장·전 팀장)
  TEAM_FILLED            // 팀 정원 다 참 (팀장)
  USER_SIGNED_UP         // 가입 신청 (운영진)
  USER_APPROVED          // 가입 승인 (본인)
  BOOKMARKED_TEAM_SPOT_OPENED // 별표한 팀에 빈자리 (별표한 비멤버)
  TEAM_RECRUITMENT_DEADLINE   // 모집 마감 D-1, 빈자리 있는 팀 (팀장) — 크론, §3.1
}

model Notification {
  id          Int              @id @default(autoincrement())
  recipientId Int
  recipient   User             @relation("notifications", fields: [recipientId], references: [id], onDelete: Cascade)
  type        NotificationType
  payload     Json             // 스냅샷 (타입별 구조, §2)
  readAt      DateTime?        // null = 안 읽음 (읽음 상태의 SSOT)
  createdAt   DateTime         @default(now())

  @@index([recipientId, readAt])
  @@map("notifications")
}

model PushSubscription {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation("pushSubscriptions", fields: [userId], references: [id], onDelete: Cascade)
  endpoint  String   @unique   // 브라우저가 발급, 기기/브라우저별 고유
  p256dh    String
  auth      String
  createdAt DateTime @default(now())

  @@index([userId])
  @@map("push_subscriptions")
}
```

`User`에 역관계: `notifications Notification[] @relation("notifications")`, `pushSubscriptions PushSubscription[] @relation("pushSubscriptions")`.

**모델링 근거**:

- **`readAt` 단일 필드**: `isRead` boolean은 `readAt != null`로 파생되므로 두지 않는다. 파생 컬럼 중복은 정합성 위반(SSOT). 안 읽음 = `where: { readAt: null }`.
- **`payload` 스냅샷**: 이벤트 시점의 이름을 저장. 알림은 과거 사실의 기록이라 팀·곡명이 나중에 바뀌어도 문구가 안 깨지고 조회 시 join이 없다. ADR-0003 원칙1("알림함 SSOT")과 정합.
- **`type` discriminator**: `payload`(Json)를 어느 zod 스키마로 파싱할지 결정 + 클라 렌더 분기.
- **`PushSubscription.endpoint @unique`**: 같은 브라우저 재구독 시 중복 방지. 발송이 `410 Gone`이면 해당 row 삭제(#546 죽은 구독 정리).

## 2. 이벤트 taxonomy · emit 지점 · 수신자 · payload

위 이벤트 표(#347)를 기존 서비스 코드에 매핑한다.

| type                          | emit 지점 (코드)                                                                                                                                                                                                                                                | 수신자                                                       | payload 스냅샷                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `TEAM_MEMBER_CHANGE`          | apply([team.service.ts:396](../../../apps/api/src/team/team.service.ts#L396), 추가) · unapply([:470](../../../apps/api/src/team/team.service.ts#L470), 제거) · update 로스터([:245](../../../apps/api/src/team/team.service.ts#L245))                           | 해당 팀 멤버 전원 (− actor)                                  | `{ teamId, performanceId, teamName, changeType: ADDED/REMOVED, memberName, sessionNames: [] }` |
| `TEAM_ATTRIBUTE_CHANGE`       | update([team.service.ts:162](../../../apps/api/src/team/team.service.ts#L162))                                                                                                                                                                                  | 해당 팀 멤버 전원 (− actor)                                  | `{ teamId, performanceId, teamName, changedFields: [] }` (`performanceId` 변경 포함, §6)       |
| `TEAM_CREATED`                | create([team.service.ts:109](../../../apps/api/src/team/team.service.ts#L109))                                                                                                                                                                                  | 해당 공연 소속 전체 유저 (− actor)                           | `{ performanceId, performanceName, teamId, teamName }`                                         |
| `PERFORMANCE_CREATED`         | create([performance.service.ts:23](../../../apps/api/src/performance/performance.service.ts#L23))                                                                                                                                                               | 전체 승인 유저 (`isApproved = true`)                         | `{ performanceId, performanceName }`                                                           |
| `PERFORMANCE_UPDATED`         | update([performance.service.ts:112](../../../apps/api/src/performance/performance.service.ts#L112), `name`·`startAt`·`endAt`·`location` 바뀔 때만)                                                                                                              | 해당 공연 모든 팀원·팀장 (− actor)                           | `{ performanceId, performanceName, changedFields: [] }`                                        |
| `TEAM_DELETED`                | remove([team.service.ts:412](../../../apps/api/src/team/team.service.ts#L412), 삭제 전 조회분으로 수신자 확정)                                                                                                                                                  | 삭제 전 팀원·팀장 (− actor)                                  | `{ performanceId, performanceName, teamName }`                                                 |
| `TEAM_LEADER_CHANGED`         | update([team.service.ts:353](../../../apps/api/src/team/team.service.ts#L353), `leaderId` 변경)                                                                                                                                                                 | 새 팀장(`assigned: true`)·전 팀장(`false`) 각 1건 (− actor)  | `{ teamId, performanceId, teamName, leaderName, assigned }`                                    |
| `TEAM_FILLED`                 | 스스로 지원(apply)해 마지막 자리가 찼을 때, 리스너에서 판정([notification.listener.ts:362](../../../apps/api/src/notification/notification.listener.ts#L362))                                                                                                   | 팀장 (− actor)                                               | `{ teamId, performanceId, teamName }`                                                          |
| `BOOKMARKED_TEAM_SPOT_OPENED` | 멤버 제거(REMOVED) 이벤트에서 리스너가 가지([notification.listener.ts:355](../../../apps/api/src/notification/notification.listener.ts#L355)), 커밋 후 스냅샷에 실제 빈자리가 난 세션만                                                                         | 그 팀을 별표한(#761) 유저 중 비멤버 (− actor, − 빠진 당사자) | `{ teamId, performanceId, teamName, sessionNames: [] }`                                        |
| `TEAM_RECRUITMENT_DEADLINE`   | 크론(§3.1): 내일(KST) `endAt`인 공연의 빈자리 있는 팀마다 하루 1회([reminder.service.ts:26](../../../apps/api/src/reminder/reminder.service.ts#L26)) → 리스너([notification.listener.ts:286](../../../apps/api/src/notification/notification.listener.ts#L286)) | 팀장                                                         | `{ teamId, performanceId, teamName, openSlots: [{ sessionName, count }] }`                     |
| `USER_SIGNED_UP`              | signUp([auth.service.ts:32](../../../apps/api/src/auth/auth.service.ts#L32)) — 운영진이 `POST /users`로 만든 계정은 제외                                                                                                                                        | 운영진(`isAdmin`) 전원                                       | `{ userId, userName, generationOrder }`                                                        |
| `USER_APPROVED`               | approveUser([users.service.ts:244](../../../apps/api/src/users/users.service.ts#L244), 이미 승인된 계정이면 무시)                                                                                                                                               | 승인된 본인                                                  | `{ userName }`                                                                                 |

> 피드백 시스템 이벤트는 요구사항 확정 후 추가(#347).

**수신자 해석 로직**:

- **팀 멤버 전원**: 팀의 `teamSessions → members`의 `userId` ∪ `{ team.leaderId }`, distinct.
- **공연 소속 전체 유저**: 해당 공연의 모든 팀에 속한 멤버·리더 userId, distinct. 스키마에 "공연 참여" 엔티티가 따로 없고 팀 멤버십이 유일한 소속 데이터라 이 정의로 확정(2026-10-15). 아직 팀에 들지 않은 유저는 수신 대상이 아니며, 새 팀은 팀 목록 페이지에서 확인한다.
- **전체 승인 유저**: `User where isApproved = true`.

## 3. 발송 파이프라인

```
도메인 서비스 (§2 emit 지점, 커밋 뒤)
   │  emit("team.member.added" 등, { teamId, userId, sessionIds, actorId })   ← ID만. 알림을 모름
   ▼
NotificationListener (apps/api/src/notification/notification.listener.ts)
   │  수신자 해석 + 스냅샷 조립 → recipient마다 Notification row 1개 (fan-out)   ← 인앱함 SSOT
   │  emit("notification.created", { recipientIds, content: { type, payload } })
   ▼
PushListener (#546 후반)
   └─ recipient들의 PushSubscription 전체에 web-push 발송, 응답 410 Gone → 해당 구독 삭제
```

- **두 단계 seam인 이유**: 서비스는 도메인 사실(`team.created`)만 말하고 알림·수신자·채널을 모른다(의존 방향: notification → team/performance). 푸시는 **저장된 알림에서 파생** — ADR-0003 원칙1(알림함 SSOT, 푸시 best-effort)이 코드 구조 그대로다. 채널 추가 = `notification.created` 리스너 추가.
- **신뢰성 경계**: `@nestjs/event-emitter`는 같은 프로세스 내 best-effort, 브로커 없음. 알림 생성/발송 실패는 로깅만 하고 원본 트랜잭션(apply/create 등, 이미 커밋됨) 응답을 막지 않는다. 무손실 보장이 필요해지면 outbox로 승격.
- **발송**: NestJS `web-push` 라이브러리 직접 호출, 큐 미도입(#546 — ~100명 fan-out에 과투자). VAPID private은 SealedSecret(API), public은 web 환경변수(#547).

### 3.1 시간 기반 리마인더 (크론, #796)

사용자 행동이 아니라 시각이 트리거인 알림(모집 마감 D-1, 동방 예약 1시간 전 등)은 `ReminderScheduler`([reminder.scheduler.ts](../../../apps/api/src/reminder/reminder.scheduler.ts))가 **API 프로세스 안에서 10분마다** 깨워 `ReminderService`의 리마인더를 차례로 돌린다. 각 리마인더는 "지금 due인 대상"만 찾아 §3 파이프라인의 맨 위(도메인 이벤트)로 흘려보내고, 수신자·문구는 리스너가 평소처럼 맡는다.

- **왜 in-process `@nestjs/schedule`인가**: 10분 주기여도 비용 0, 리마인더 3종 모두 ±10분이면 충분. K8s CronJob은 내부 엔드포인트·인증 시크릿(또는 CLI 엔트리)이 더 생기고 10분마다 pod를 띄운다. BullMQ 지연 잡은 분 단위 정확성이 필요할 때 — 지금은 없음. 핵심 로직이 `run(now)`로 트리거와 분리돼 있어 나중에 CronJob+CLI로 바꿔도 호출부 1줄.
- **중복 실행 방지**: Redis `SET reminder:lock NX PX 5m`. pod가 여럿이어도 한 번만 돈다. 지금은 `replicas: 1`.
- **멱등**: 리마인더마다 DB로 판정 — 모집 마감 D-1은 "오늘(KST) 만들어진 같은 유형 알림이 그 팀에 있으면 skip". 날짜 경계는 `Asia/Seoul`(서버는 UTC, [kst.ts](../../../apps/api/src/reminder/kst.ts)).
- **발송 시각**: 날짜 단위 리마인더는 자정 넘은 첫 tick(00:00–00:10 KST)에 만들어진다. 밤중에 폰이 울리는 문제는 리마인더가 아니라 **푸시 계층의 방해금지 시간대**로 막는다(후속 PR) — 이벤트 알림(새벽 탈퇴 등)까지 한 번에 보호되고, 알림함 row는 즉시 생겨도 무방하기 때문.
- **마감 정각 경계**: 지원 가능 조건이 `endAt > now`라 `endAt` 순간엔 이미 닫힌다. 그래서 "내일 마감" 창은 `(내일 00:00, 모레 00:00]` — 모레 00:00 정각 마감은 내일, 내일 00:00 정각 마감은 오늘.
- **관측**: 실행마다 `Sentry.metrics.count("reminder.run", { reminder, result: ok | error })`, 리마인더 실패와 Redis 락 획득 실패는 `captureException` + 로그(`@nestjs/schedule`은 예외를 Logger로만 삼켜 Sentry Issue가 안 생기므로 직접 보낸다). 리마인더 하나가 실패해도 나머지는 돈다.
- `@nestjs/schedule`은 **6.x 고정** — 12.x는 ESM 전용이라 Jest가 못 읽는다(event-emitter 12와 같은 함정).

## 4. API (#546 정합)

JWT 가드. 알림은 `recipientId = req.user`로 스코프.

| 메서드 | 경로                            | 용도                                                                                            |
| ------ | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| GET    | `/notifications?cursor=&limit=` | 본인 알림 목록, 최신순, cursor 페이지네이션                                                     |
| GET    | `/notifications/unread-count`   | `{ count }`                                                                                     |
| PATCH  | `/notifications/:id/read`       | 단건 읽음. 소유 검증(남의 것 404). idempotent                                                   |
| PATCH  | `/notifications/read-all`       | 본인 전체 읽음                                                                                  |
| POST   | `/push/subscriptions`           | 구독 등록 (브라우저 `PushSubscription.toJSON()` 그대로: `{ endpoint, keys: { p256dh, auth } }`) |
| DELETE | `/push/subscriptions`           | 구독 해제 (`{ endpoint }`)                                                                      |

## 5. 공유 타입 (`@repo/shared-types/notification`)

- `schema.ts`: `NotificationType` enum, payload zod(`type` 기준 discriminated union, §2의 4종), 알림 응답 스키마, 구독 등록 DTO. `types.ts`: 파생.
- 문구는 저장하지 않는다. 프론트가 `type` + `payload`로 렌더하며 용어집("지원"·"세션") 준수.
- #547(web)이 이 DTO에 의존 → 스키마 확정이 프론트 연동의 선행.

## 6. 구현 결정 (refinements)

- **actor 제외**: 자기 행동의 결과는 자기에게 알리지 않는다. (예: 멤버가 self-apply([team.controller.ts](../../../apps/api/src/team/team.controller.ts)로 본인 지원)하면 그 멤버는 수신자에서 빠지고, 기존 팀원들이 "새 멤버 합류"를 받는다.)
- **제거된 멤버 본인도 수신**: 팀장·운영진이 로스터에서 뺀 멤버는 커밋 뒤 스냅샷엔 없지만 이벤트 시점엔 팀원이었으므로 `REMOVED` 알림을 받는다. 스스로 나간(unapply) 경우는 actor 제외로 빠진다. (리뷰에서 발견, 2026-10-15)
- **nullable 필드 변경 감지**: `update`는 `description`·`image`·`songYoutubeVideoUrl`을 `?? null`로 쓰므로 요청에서 생략 = null 저장. `changedFields` 계산도 같은 규칙(생략을 null로 비교). "안 보내면 유지"는 `performanceId`뿐.
- **다중 세션 배칭**: `apply`의 `applyTeamDto`는 배열(한 번에 여러 세션 지원). `TEAM_MEMBER_CHANGE` **1건**으로 묶고 `sessionNames`에 나열 — 세션당 1건은 스팸.
- **팀 공연 이동**: `update`로 팀의 `performanceId`가 바뀔 수 있다([#666](https://github.com/skku-amang/main/pull/666)). 이때도 `TEAM_ATTRIBUTE_CHANGE` 1건으로 처리 — `changedFields`에 `performanceId` 포함, payload의 `performanceId`는 변경 후 값. 옮겨간 공연 쪽 유저에게 `TEAM_CREATED`를 따로 쏘지 않는다(드문 운영 동작, 이벤트 분기 비용 대비 효용 낮음).
- **읽음 UX**: 알림함 항목 클릭 시 개별 읽음 + 딥링크 이동, "모두 읽음" 버튼 별도. 드롭다운 여는 것만으로 자동 읽음 처리하지 않는다(지나쳐도 안 놓치게).
- **전달**: 인앱 알림함은 조회 시 fetch(+`refetchOnWindowFocus`). 모바일 도달은 Web Push(ADR-0003). 별도 실시간 소켓 없음.

## 7. 비범위

| 항목                     | 사유·연결                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 이메일 / SMS 채널        | ADR-0003·#347에서 분리. 도입 시 별도 결정                                                                                                                          |
| 비밀번호 찾기 인증 메일  | 알림 아님(auth 흐름), #528 영역                                                                                                                                    |
| 피드백 시스템 이벤트     | 요구사항 확정 후(#347)                                                                                                                                             |
| 발송 큐                  | #546 미도입(과투자)                                                                                                                                                |
| 오프라인 캐싱 / full PWA | #547 미도입(ADR-0003 원칙5)                                                                                                                                        |
| 이벤트별 푸시 수신 토글  | #347 요구사항이나 v0.1 미도입 — 4종 모두 전원 관련이라 유형별 끄기 효용 낮음. 구독 해제 = 전체 opt-out. 후속 [#708](https://github.com/skku-amang/main/issues/708) |

## 8. 핵심 결정 이력

| 결정              | 선택                         | 근거                                                                    |
| ----------------- | ---------------------------- | ----------------------------------------------------------------------- |
| 데이터 SSOT       | Notification 테이블(인앱함)  | ADR-0003 원칙1 — 푸시 실패와 무관하게 알림 보존                         |
| 생성 seam         | 도메인 이벤트(EventEmitter)  | 저장·발송 독립 리스너, 채널 = 리스너. #546 명시                         |
| 읽음 상태         | `readAt` 단일                | `isRead`는 파생 → 중복 제거(SSOT)                                       |
| payload           | 이벤트 시점 스냅샷           | 알림은 과거 사실, 이름 변경에 안 깨짐, join 0                           |
| 수신자(멤버 변경) | 팀원 전원 − actor            | #347 broadcast 모델 + 자기 행동 자기 제외                               |
| 그래뉴러리티      | 다중 세션 = 1건              | apply DTO가 배열, 스팸 방지                                             |
| 구독 dedup        | `endpoint @unique`, 410 삭제 | 기기별 고유, 죽은 구독 정리(#546)                                       |
| 수신자(팀 생성)   | 해당 공연 팀 멤버·리더       | 스키마에 공연 참여 데이터는 팀 멤버십뿐. 미소속 유저는 팀 목록에서 확인 |
| 팀 공연 이동      | `TEAM_ATTRIBUTE_CHANGE` 1건  | #666로 가능해진 드문 운영 동작, 별도 이벤트 분기 안 함                  |
| 푸시 유형별 토글  | v0.1 비범위 → #708           | 4종 전원 관련, 구독 해제가 전체 opt-out 역할                            |

---

## 변경 이력

- **2026-10-17**: 시간 기반 리마인더 틀(§3.1, in-process 크론 + Redis 락 + DB 멱등) + 첫 사례 `TEAM_RECRUITMENT_DEADLINE`(모집 마감 D-1, 팀장) (#796).
- **2026-10-16**: `BOOKMARKED_TEAM_SPOT_OPENED` 추가 — 팀원이 빠지면 그 팀을 별표한(#761) 비멤버에게 (#794).
- **2026-10-16**: 유형 6종 추가(공연 변경·팀 삭제·팀장 교체·정원 참·가입 신청·가입 승인, #790–#793·#795 → [#800](https://github.com/skku-amang/main/pull/800)). 대상 페이지 도달 시 자동 읽음(#786 → #788): `PATCH /notifications/read { teamId | performanceId }`, 팀 상세·공연 상세·공연 팀 목록에서 호출.

- **2026-10-15 (구현 중)**: §3을 2단계 리스너 체인(도메인 이벤트 → 저장 → `notification.created` → 푸시)으로 갱신. 구현 계획은 [plans/2026-10-15-notification-system.md](plans/2026-10-15-notification-system.md).
- **2026-10-15**: 최신 main 기준으로 코드 앵커 6곳 재지정(#663·#666 반영). 미결이던 "공연 소속" 정의를 해당 공연 팀 멤버·리더로 확정. 팀 공연 이동(#666) 처리 방식, 푸시 유형별 토글 비범위(#708) 추가.
- **2026-07-21**: #347/ADR-0003/#546/#547 정합으로 전면 재작성. 초안의 팀장-단독 수신·단일 이벤트·이메일 로드맵 폐기(상위 SSOT와 충돌). #347 이벤트 4종·팀원전원 수신·Web Push 채널·PushSubscription 반영.
