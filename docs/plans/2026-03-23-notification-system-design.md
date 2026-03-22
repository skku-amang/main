# 알림 시스템 설계

## 개요

AMANG 동아리 관리 시스템에 알림 기능을 추가한다. 팀/공연 변경 사항을 멤버에게 인앱 알림, 이메일, 문자로 전달한다.

## 목표

- 팀 인원/속성 변경, 새 팀 생성, 새 공연 생성 시 관련 멤버에게 알림 발송
- 사용자가 이벤트별 × 채널별로 알림 수신 여부를 제어
- 인앱 Inbox에서 알림 목록 확인 및 읽음 처리

## 채널

### MVP

| 채널       | 서비스  | 비용                               | 비고                              |
| ---------- | ------- | ---------------------------------- | --------------------------------- |
| 인앱 Inbox | DB 저장 | 무료                               | 항상 활성                         |
| 이메일     | AWS SES | ~0.01원/건                         | Terraform 선언적 관리             |
| 문자 (SMS) | Solapi  | ~9원/건 (90바이트 이하), LMS ~30원 | 당일 세팅, 개인 등록 가능, TS SDK |

### 추후 추가

| 채널     | 방식                         | 비용 |
| -------- | ---------------------------- | ---- |
| 카카오톡 | 나에게 보내기 (카카오 OAuth) | 무료 |

카카오 추가 시 SMS를 fallback으로 전환하여 비용 절감.

### 월 비용 추정

동아리 부원 ~50명, 월 알림 이벤트 ~20건 기준:

- 이메일: ~1,000건 × 0.01원 = ~10원 (사실상 무료)
- SMS: ~1,000건 × 9원 = ~9,000원
- **합계: ~9,000원/월**

## 아키텍처

### 이벤트 처리 방식

NestJS `@nestjs/event-emitter`를 사용한 인프로세스 비동기 처리.

- 별도 메시지 큐(Redis, RabbitMQ) 불필요
- API 프로세스 내에서 이벤트 발행 → 리스너가 비동기로 알림 처리
- 알림 발송 실패가 원래 API 응답에 영향을 주지 않음
- 동아리 규모(~50명)에 충분한 수준

추후 발송량 증가 시 Redis + BullMQ 또는 PostgreSQL 기반 큐(pgBoss)로 교체 가능.

`AppModule`에 `EventEmitterModule.forRoot()` 등록 필요.

### 이벤트 흐름

```text
[기존 Service의 mutation 메서드]
    ↓ eventEmitter.emit('team.created', payload)
[NotificationService.handleTeamCreated()]
    ↓ 1. Notification row 생성 (인앱 Inbox, 항상)
    ↓ 2. 수신자별 preference 조회
    ↓ 3. 채널별 발송
        ├── EmailChannel.send()   ← preference에 따라
        └── SmsChannel.send()     ← preference에 따라, phone 있는 유저만
```

### 핵심 원칙

- **발행 측은 알림을 모름**: 서비스에서 이벤트만 발행, 알림 로직 침투 없음
- **본인 제외**: 본인이 한 행동에 대해 본인에게 알림 안 감
- **실패 무시**: 알림 발송 실패해도 원래 API 응답에 영향 없음

## 이벤트 정의

| 이벤트                  | 트리거 시점          | 수신자                   | 본인 제외 |
| ----------------------- | -------------------- | ------------------------ | --------- |
| `TEAM_MEMBER_CHANGE`    | 팀 멤버 추가/제거    | 해당 팀 멤버 전원        | O         |
| `TEAM_ATTRIBUTE_CHANGE` | 팀 곡명/세션 등 변경 | 해당 팀 멤버 전원        | O         |
| `TEAM_CREATED`          | 공연에 새 팀 생성    | 해당 공연 소속 전체 유저 | O         |
| `PERFORMANCE_CREATED`   | 새 공연 생성         | 전체 유저                | O         |

### 이벤트 페이로드 타입

```typescript
// notification.events.ts

interface TeamMemberChangeEvent {
  actorId: number;
  teamId: number;
  action: "added" | "removed";
  affectedUserIds: number[];
}

interface TeamAttributeChangeEvent {
  actorId: number;
  teamId: number;
  changedFields: string[]; // e.g., ['songName', 'songArtist']
}

interface TeamCreatedEvent {
  actorId: number;
  teamId: number;
  performanceId: number;
}

interface PerformanceCreatedEvent {
  actorId: number;
  performanceId: number;
}
```

### 수신자 결정 쿼리 경로

- **팀 멤버 조회**: `Team → TeamSession → TeamMember → User` (distinct userId)
- **공연 소속 유저 조회**: `Performance → Team → TeamSession → TeamMember → User` (distinct userId)
- **전체 유저**: `User` 전체 조회
- 추가된 멤버 본인도 알림 수신 (본인 제외는 `actorId`만 해당)

### 실패 처리

- 채널 발송 실패 시 structured 로그 기록 (채널, 수신자, 에러 내용)
- API 응답에 영향 없음 (try-catch로 감싸서 무시)
- 재시도 없음 (MVP). 추후 큐 전환 시 재시도 로직 추가 가능

## 데이터 모델

### User 변경

```prisma
model User {
  // 기존 필드...
  phone                   String?
  notifications           Notification[]
  notificationPreferences NotificationPreference[]
}
```

`phone`은 nullable. 전화번호 없는 유저는 SMS 알림 건너뜀. Zod 스키마에서 한국 전화번호 형식(`010XXXXXXXX`) 검증 추가.

### NotificationPreference

```prisma
enum NotificationEventType {
  TEAM_MEMBER_CHANGE
  TEAM_ATTRIBUTE_CHANGE
  TEAM_CREATED
  PERFORMANCE_CREATED
}

enum NotificationChannel {
  EMAIL
  SMS
  // KAKAO  ← 추후 추가
}

model NotificationPreference {
  id        Int                    @id @default(autoincrement())
  userId    Int
  eventType NotificationEventType
  channel   NotificationChannel
  enabled   Boolean                @default(true)
  createdAt DateTime               @default(now())
  updatedAt DateTime               @updatedAt
  user      User                   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, eventType, channel])
  @@map("notification_preferences")
}
```

기본값 전략: **opt-out 방식**. row가 없으면 enabled로 간주. 사용자가 명시적으로 끈 것만 `enabled: false`로 저장.

### Notification (인앱 Inbox)

```prisma
model Notification {
  id        Int                    @id @default(autoincrement())
  userId    Int
  eventType NotificationEventType
  title     String
  body      String
  url       String?
  readAt    DateTime?
  createdAt DateTime               @default(now())
  user      User                   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, readAt])
  @@map("notifications")
}
```

## 모듈 구조

```text
apps/api/src/notification/
├── notification.module.ts
├── notification.service.ts              ← 이벤트 리스너, 수신자 결정, 라우팅
├── notification.events.ts               ← 이벤트 페이로드 타입 정의
├── notification-preference/
│   ├── notification-preference.controller.ts
│   ├── notification-preference.service.ts
│   └── dto/
├── notification-inbox/
│   ├── notification-inbox.controller.ts
│   ├── notification-inbox.service.ts
│   └── dto/
└── channels/
    ├── channel-sender.interface.ts       ← 공통 인터페이스
    ├── email.channel.ts                  ← AWS SES
    └── sms.channel.ts                    ← Solapi
```

### 채널 인터페이스

```typescript
interface ChannelSender {
  send(
    recipient: { email: string; phone?: string },
    message: NotificationMessage,
  ): Promise<void>;
  supports(user: { email: string; phone?: string }): boolean;
}

interface NotificationMessage {
  title: string;
  body: string;
  url?: string;
}
```

- `supports()`: SMS 채널은 `phone`이 있을 때만 true 반환
- 각 채널이 `ChannelSender` 인터페이스 구현, NotificationService가 순회하며 발송
- 인앱 알림은 채널 인터페이스 밖에서 직접 DB 저장 (항상 활성, preference 무관)

## API 엔드포인트

### 알림 Inbox

```text
GET    /users/me/notifications              ← 알림 목록 (커서 기반 페이지네이션)
GET    /users/me/notifications/unread-count  ← 안읽은 개수 (뱃지용)
PATCH  /users/me/notifications/:id/read      ← 읽음 처리 (readAt 타임스탬프 기록)
PATCH  /users/me/notifications/read-all      ← 전체 읽음
```

### 알림 설정

```text
GET    /users/me/notification-preferences    ← 전체 설정 조회
PUT    /users/me/notification-preferences    ← 일괄 업데이트
```

설정 조회 시 DB에 row가 없는 조합도 `enabled: true`로 채워서 전체 매트릭스를 반환한다.

`PUT` 요청 본문은 변경할 항목의 배열:

```typescript
// UpdateNotificationPreferenceRequest
{
  preferences: Array<{
    eventType: NotificationEventType;
    channel: NotificationChannel;
    enabled: boolean;
  }>;
}
```

## 공유 타입 (@repo/shared-types)

`NotificationEventType`, `NotificationChannel` enum과 관련 Zod 스키마를 `@repo/shared-types`에 정의. 프론트/백엔드가 동일 타입 사용 (SSOT).

## API 클라이언트 (@repo/api-client)

```typescript
class ApiClient {
  // Inbox
  getMyNotifications(cursor?: number): Promise<PaginatedNotificationResponse>;
  getUnreadNotificationCount(): Promise<{ count: number }>;
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(): Promise<void>;

  // Preference
  getMyNotificationPreferences(): Promise<NotificationPreferenceResponse[]>;
  updateMyNotificationPreferences(
    data: UpdateNotificationPreferenceRequest,
  ): Promise<void>;
}
```

## 프론트엔드

### React Query 훅 (apps/web/hooks/api/)

기존 `createQueryHook`/`createMutationHook` 패턴 활용.

### 알림 설정 UI

프로필/설정 페이지 내 이벤트 타입별 행 × 채널별 토글 매트릭스:

```text
                인앱    이메일   문자
팀 인원 변경    [✓]    [✓]     [☐]
팀 속성 변경    [✓]    [✓]     [☐]
새 팀 생성      [✓]    [✓]     [☐]
새 공연 생성    [✓]    [✓]     [☐]
```

인앱은 항상 ON (비활성 토글로 표시), 이메일/SMS만 제어 가능.

### 알림 Inbox UI

헤더 벨 아이콘 + 안읽은 개수 뱃지. 클릭 시 드롭다운 또는 페이지로 알림 목록 표시. 각 항목 클릭 시 읽음 처리 + url로 이동.

## 인프라

### Terraform (AWS SES)

```hcl
resource "aws_ses_domain_identity" "amang" {
  domain = "amang.json-server.win"
}

resource "aws_ses_domain_dkim" "amang" {
  domain = aws_ses_domain_identity.amang.domain
}

# Route53 DKIM/SPF 레코드 (스팸 방지 필수)
# 실제 구현 시 Route53 또는 Cloudflare DNS에 DKIM CNAME 3개 + SPF TXT 레코드 추가
```

### 환경변수 (SealedSecret으로 K8s 관리)

```bash
# AWS SES
AWS_SES_REGION=ap-northeast-2
AWS_SES_ACCESS_KEY_ID=...
AWS_SES_SECRET_ACCESS_KEY=...
AWS_SES_FROM_EMAIL=noreply@amang.json-server.win

# Solapi
SOLAPI_API_KEY=...
SOLAPI_API_SECRET=...
SOLAPI_SENDER_PHONE=010XXXXXXXX
```

### 행정 처리

- AWS SES: 샌드박스 해제 요청 (1~2일)
- Solapi: 발신번호 사전등록 (당일, 개인 등록 가능)

## 확장 계획

1. **카카오 나에게 보내기**: User에 카카오 OAuth 연동, `KakaoChannel` 추가, `NotificationChannel` enum에 `KAKAO` 추가
2. **큐 기반 처리**: 발송량 증가 시 Redis + BullMQ 또는 pgBoss로 전환
3. **동방/물품 예약 알림**: 이벤트 타입 추가 (`RENTAL_APPROVED`, `RENTAL_REMINDER` 등)
