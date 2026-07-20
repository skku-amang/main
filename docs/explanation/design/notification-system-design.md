# 알림 시스템 구현 설계 (#347)

본 문서는 알림 시스템의 **구현 설계 SSOT**. 제품 결정·채널 결정은 아래 상위 문서가 SSOT이며, 본 문서는 그것들이 구현에 위임한 빈칸(데이터 모델·이벤트 매핑·수신자 해석)을 확정한다.

- 상태: 설계 확정, 구현 대기
- 상위: [#347](https://github.com/skku-amang/main/issues/347) 알림 시스템(무엇), [ADR-0003](../adr/0003-web-push-notification-channel.md) 모바일 채널(Web Push)
- 하위 작업: [#546](https://github.com/skku-amang/main/issues/546) 백엔드(저장·조회·발송), [#547](https://github.com/skku-amang/main/issues/547) web(구독·알림함 UI)
- 범위 밖 연결: 이메일/SMS(ADR-0003에서 분리), 비밀번호 찾기 인증 메일([#528](https://github.com/skku-amang/main/issues/528))

## 0. 문서 경계

| 결정 | SSOT |
|---|---|
| 어떤 이벤트를, 누구에게 | #347 (이벤트 표) |
| 모바일 도달 채널 = Web Push | ADR-0003 |
| 백엔드 요구(저장·구독·발송) | #546 |
| web 요구(SW·soft-ask·알림함) | #547 |
| **데이터 모델·payload·emit 지점·수신자 해석 로직** | **본 문서** (#546이 "모델링은 백엔드 재량"으로 위임) |

## 1. 데이터 모델

`packages/database/prisma/schema.prisma`.

```prisma
enum NotificationType {
  TEAM_MEMBER_CHANGE     // 팀 멤버 추가/제거
  TEAM_ATTRIBUTE_CHANGE  // 팀 곡명/세션 등 변경
  TEAM_CREATED           // 공연에 새 팀 생성
  PERFORMANCE_CREATED    // 새 공연 생성
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

| type | emit 지점 (코드) | 수신자 | payload 스냅샷 |
|---|---|---|---|
| `TEAM_MEMBER_CHANGE` | apply([team.service.ts:375](../../../apps/api/src/team/team.service.ts#L375), 추가) · unapply([:449](../../../apps/api/src/team/team.service.ts#L449), 제거) · update 로스터([:227](../../../apps/api/src/team/team.service.ts#L227)) | 해당 팀 멤버 전원 (− actor) | `{ teamId, performanceId, teamName, changeType: ADDED/REMOVED, memberName, sessionNames: [] }` |
| `TEAM_ATTRIBUTE_CHANGE` | update([team.service.ts:155](../../../apps/api/src/team/team.service.ts#L155)) | 해당 팀 멤버 전원 (− actor) | `{ teamId, performanceId, teamName, changedFields: [] }` |
| `TEAM_CREATED` | create([team.service.ts:102](../../../apps/api/src/team/team.service.ts#L102)) | 해당 공연 소속 전체 유저 (− actor) | `{ performanceId, performanceName, teamId, teamName }` |
| `PERFORMANCE_CREATED` | create([performance.service.ts:21](../../../apps/api/src/performance/performance.service.ts#L21)) | 전체 승인 유저 (`isApproved = true`) | `{ performanceId, performanceName }` |

> 피드백 시스템 이벤트는 요구사항 확정 후 추가(#347).

**수신자 해석 로직**:

- **팀 멤버 전원**: 팀의 `teamSessions → members`의 `userId` ∪ `{ team.leaderId }`, distinct.
- **공연 소속 전체 유저**: 해당 공연의 모든 팀에 속한 멤버·리더 userId, distinct. ⚠️ "공연 소속"의 정확한 정의는 #347 작성자 확인 필요(기존 팀 멤버 한정 vs 참여 의사 유저 포함).
- **전체 승인 유저**: `User where isApproved = true`.

## 3. 발송 파이프라인

```
도메인 이벤트 (§2 emit 지점)
   │  eventEmitter.emit(type, payload + actorId + recipientIds)
   ▼
@nestjs/event-emitter (in-process, best-effort)
   ├─→ NotificationListener → recipient마다 Notification row 1개 (fan-out)   ← 인앱함 SSOT
   └─→ PushListener        → recipient들의 PushSubscription 전체에 web-push 발송
                             └ 응답 410 Gone → 해당 구독 삭제
```

- **이벤트 seam인 이유**: 저장(인앱)과 발송(푸시)이 같은 이벤트를 구독하는 독립 리스너. 채널 추가 = 리스너 추가. ADR-0003 원칙1(알림함 SSOT, 푸시 best-effort)이 이 분리와 정확히 일치 — 푸시 실패해도 인앱 row는 남는다.
- **신뢰성 경계**: `@nestjs/event-emitter`는 같은 프로세스 내 best-effort, 브로커 없음. 알림 생성/발송 실패는 로깅만 하고 원본 트랜잭션(apply/create 등, 이미 커밋됨) 응답을 막지 않는다. 무손실 보장이 필요해지면 outbox로 승격.
- **발송**: NestJS `web-push` 라이브러리 직접 호출, 큐 미도입(#546 — ~100명 fan-out에 과투자). VAPID private은 SealedSecret(API), public은 web 환경변수(#547).

## 4. API (#546 정합)

JWT 가드. 알림은 `recipientId = req.user`로 스코프.

| 메서드 | 경로 | 용도 |
|---|---|---|
| GET | `/notifications?cursor=&limit=` | 본인 알림 목록, 최신순, cursor 페이지네이션 |
| GET | `/notifications/unread-count` | `{ count }` |
| PATCH | `/notifications/:id/read` | 단건 읽음. 소유 검증(남의 것 404). idempotent |
| PATCH | `/notifications/read-all` | 본인 전체 읽음 |
| POST | `/push/subscriptions` | 구독 등록 (`{ endpoint, p256dh, auth }`) |
| DELETE | `/push/subscriptions` | 구독 해제 (`{ endpoint }`) |

## 5. 공유 타입 (`@repo/shared-types/notification`)

- `schema.ts`: `NotificationType` enum, payload zod(`type` 기준 discriminated union, §2의 4종), 알림 응답 스키마, 구독 등록 DTO. `types.ts`: 파생.
- 문구는 저장하지 않는다. 프론트가 `type` + `payload`로 렌더하며 용어집("지원"·"세션") 준수.
- #547(web)이 이 DTO에 의존 → 스키마 확정이 프론트 연동의 선행.

## 6. 구현 결정 (refinements)

- **actor 제외**: 자기 행동의 결과는 자기에게 알리지 않는다. (예: 멤버가 self-apply([team.controller.ts](../../../apps/api/src/team/team.controller.ts)로 본인 지원)하면 그 멤버는 수신자에서 빠지고, 기존 팀원들이 "새 멤버 합류"를 받는다.)
- **다중 세션 배칭**: `apply`의 `applyTeamDto`는 배열(한 번에 여러 세션 지원). `TEAM_MEMBER_CHANGE` **1건**으로 묶고 `sessionNames`에 나열 — 세션당 1건은 스팸.
- **읽음 UX**: 알림함 항목 클릭 시 개별 읽음 + 딥링크 이동, "모두 읽음" 버튼 별도. 드롭다운 여는 것만으로 자동 읽음 처리하지 않는다(지나쳐도 안 놓치게).
- **전달**: 인앱 알림함은 조회 시 fetch(+`refetchOnWindowFocus`). 모바일 도달은 Web Push(ADR-0003). 별도 실시간 소켓 없음.

## 7. 비범위

| 항목 | 사유·연결 |
|---|---|
| 이메일 / SMS 채널 | ADR-0003·#347에서 분리. 도입 시 별도 결정 |
| 비밀번호 찾기 인증 메일 | 알림 아님(auth 흐름), #528 영역 |
| 피드백 시스템 이벤트 | 요구사항 확정 후(#347) |
| 발송 큐 | #546 미도입(과투자) |
| 오프라인 캐싱 / full PWA | #547 미도입(ADR-0003 원칙5) |

## 8. 핵심 결정 이력

| 결정 | 선택 | 근거 |
|---|---|---|
| 데이터 SSOT | Notification 테이블(인앱함) | ADR-0003 원칙1 — 푸시 실패와 무관하게 알림 보존 |
| 생성 seam | 도메인 이벤트(EventEmitter) | 저장·발송 독립 리스너, 채널 = 리스너. #546 명시 |
| 읽음 상태 | `readAt` 단일 | `isRead`는 파생 → 중복 제거(SSOT) |
| payload | 이벤트 시점 스냅샷 | 알림은 과거 사실, 이름 변경에 안 깨짐, join 0 |
| 수신자(멤버 변경) | 팀원 전원 − actor | #347 broadcast 모델 + 자기 행동 자기 제외 |
| 그래뉴러리티 | 다중 세션 = 1건 | apply DTO가 배열, 스팸 방지 |
| 구독 dedup | `endpoint @unique`, 410 삭제 | 기기별 고유, 죽은 구독 정리(#546) |

---

## 변경 이력

- **2026-07-21**: #347/ADR-0003/#546/#547 정합으로 전면 재작성. 초안의 팀장-단독 수신·단일 이벤트·이메일 로드맵 폐기(상위 SSOT와 충돌). #347 이벤트 4종·팀원전원 수신·Web Push 채널·PushSubscription 반영.
