# ADR-0002: 인증 토큰 관리 — next-auth 제거 + 백엔드 cookie 발급

**작성일**: 2026-05-26
**상태**: Draft
**작성자**: JSON (+ Claude Code 협업)
**관련 이슈**: [#358](https://github.com/skku-amang/main/issues/358)
**선행 폐기 PR/이슈**: [#444](https://github.com/skku-amang/main/pull/444), [#443](https://github.com/skku-amang/main/issues/443), [#506](https://github.com/skku-amang/main/issues/506)

## Context

### 현재 인증 구조

AMANG은 next-auth v5 Credentials provider + 백엔드 NestJS의 자체 JWT 발급 구조다.

```text
[로그인]
사용자 → 프론트 signin → next-auth Credentials authorize
  → apiClient.login() → 백엔드 POST /auth/login
  → backend가 AT/RT 발급 → 응답 body
  → next-auth가 AT/RT를 JWT cookie에 암호화 저장

[API 호출]
프론트 → ApiClient.setAccessToken(session.accessToken) → fetch with Authorization: Bearer

[Refresh]
ApiClient 401 → onTokenExpired() → next-auth update()
  → JWT 콜백이 만료 감지 → apiClient.refreshToken() → 백엔드 POST /auth/refresh
  → 새 AT/RT → JWT cookie 갱신
```

### 발견된 구조적 문제

#### 1. Race condition — JWT 콜백 auto-refresh

[apps/web/auth.ts:91-110](../../../apps/web/auth.ts#L91-L110)의 JWT 콜백이 자동 refresh를 포함. 이 콜백은 아래 5개 context에서 **독립적으로** 실행된다:

| Trigger             | 실행 context               |
| ------------------- | -------------------------- |
| RSC `auth()`        | 서버, 그 RSC 요청 scope    |
| middleware `auth()` | edge runtime               |
| `useSession()` poll | `/api/auth/session`        |
| `update()` 호출     | `/api/auth/session?update` |
| Hard navigation     | RSC streaming              |

5개가 동시에 fire되면 5개의 JWT 콜백이 병렬 실행되고, 모두 같은 만료 RT를 보고 각자 refresh 시도. 1개만 성공, 나머지는 무효해진 옛 RT를 들고 강제 로그아웃 ([#442](https://github.com/skku-amang/main/issues/442) 사용자 리포트).

#### 2. 시도된 해결책의 한계

- [#443](https://github.com/skku-amang/main/issues/443) / [#444](https://github.com/skku-amang/main/pull/444) — **서버사이드 grace period 30초**. 백엔드 설득 실패 + root cause 미해결로 폐기
- [#506](https://github.com/skku-amang/main/issues/506) — **클라이언트사이드 single-flight + Web Locks**. next-auth 안에서의 정교한 refresh 패턴 설계가 본 ADR과 throwaway 충돌로 폐기

#### 3. 부가 문제들

- **bcrypt 72-byte 절삭**: refresh token rotation이 사실상 무력화되어 있던 문제 — [#392](https://github.com/skku-amang/main/issues/392) / [#395](https://github.com/skku-amang/main/issues/395)에서 SHA-256으로 수정 완료
- **next-auth 구조 미스매치**: OAuth 흐름에 최적화된 next-auth를 Credentials 단일 provider로 사용 중. 불필요한 추상화 계층
- **Capacitor 앱 포팅 제약**: next-auth의 JWT cookie 구조는 브라우저 전용. 모바일 앱(Capacitor)에서는 Secure Storage + Authorization 헤더 방식 필요

## Decision

### 핵심 원칙

> 인증 토큰 발급·검증·갱신을 **백엔드(NestJS)가 단독 책임**진다. 프론트는 cookie/Secure Storage를 통해 토큰을 운반하는 transport 역할만 한다. next-auth는 제거한다.

### 아키텍처

```text
                      ┌─────────────────────────────────┐
                      │  Backend (NestJS)                │
                      │  - POST /auth/login              │
                      │  - POST /auth/refresh            │
                      │  - POST /auth/logout             │
                      │  - GET  /auth/me                 │
                      │  - AT/RT 발급 + httpOnly cookie  │
                      │  - 헤더/쿠키 양방향 AT 검증      │
                      └────────────┬─────────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              │                                         │
        ┌─────▼─────┐                            ┌──────▼──────┐
        │ Web 브라우저 │                          │ Capacitor 앱 │
        │  (Phase 1) │                          │  (Phase 4)  │
        │           │                            │             │
        │ AT/RT     │                            │ AT/RT       │
        │ httpOnly  │                            │ Secure      │
        │ Cookie    │                            │ Storage     │
        │           │                            │             │
        │ React     │                            │ Authorization│
        │ Context로 │                            │ Bearer 헤더 │
        │ user 정보 │                            │             │
        └───────────┘                            └─────────────┘
```

### 토큰 관리

| 항목         | Web                                                                          | Capacitor 앱 (Phase 4)             |
| ------------ | ---------------------------------------------------------------------------- | ---------------------------------- |
| AT 저장      | httpOnly cookie                                                              | Secure Storage (Keychain/Keystore) |
| RT 저장      | httpOnly cookie                                                              | Secure Storage                     |
| AT 전달      | cookie 자동 전송                                                             | `Authorization: Bearer`            |
| RT 전달      | cookie 자동 전송                                                             | body `/auth/refresh`               |
| CSRF         | **SameSite=Lax + Origin 검증**                                               | N/A (cookie 미사용)                |
| Cookie 속성  | `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age` (AT=1h, RT=7d)     | N/A                                |

### CSRF 보호 (D1)

**SameSite=Lax cookie + 백엔드 Origin/Referer 검증** 채택.

- 모든 인증 cookie는 `SameSite=Lax` 속성 부여 → 다른 사이트에서 POST/PUT/DELETE 시 cookie 자동 첨부 차단
- 백엔드는 mutate 요청(POST/PUT/PATCH/DELETE)에서 `Origin` 헤더가 허용 도메인인지 검증 (이중 안전망)
- 모던 브라우저(Chrome 80+, Firefox 69+, Safari 13+) 표준 — 한국 IT 업계 사실상 표준
- Double-submit cookie / Synchronizer pattern은 AMANG 규모·트래픽에서 불필요한 복잡도

### 세션 수명 정책 (D2)

현재 값 유지 (베이스라인 기준):

| 항목         | 현재           | 변경 후                                 |
| ------------ | -------------- | --------------------------------------- |
| AT 수명      | 3600초 (1시간) | 동일 유지                               |
| RT 수명      | 604800초 (7일) | 동일 유지                               |
| Idle timeout | 없음           | 없음 (동아리 앱 특성상 자주 접근 안 함) |

향후 사용 패턴 변화 시 별도 ADR.

### Refresh 흐름 (단일 진입점)

```text
[브라우저]
API 호출 → 401 → ApiClient interceptor
                  → POST /auth/refresh (cookie 자동 전송)
                  → 새 Set-Cookie 응답
                  → 원래 요청 재시도

[멀티탭 race 방지]
ApiClient.refreshPromise (싱글톤) — 단일 탭
+ Web Locks API ("auth-refresh") — 멀티탭
```

### 세션·사용자 정보

`useSession()` 같은 next-auth 의존 제거. 대신:

- `GET /auth/me` 백엔드 엔드포인트로 user 정보 fetch
- React Context (`AuthProvider`) + TanStack Query로 세션 상태 관리
- RSC에서 인증 필요 시: middleware에서 cookie 존재 여부 확인 후 redirect

### 기존 사용자 마이그레이션 (D3)

**일괄 강제 로그아웃 + 사전 공지** 채택.

- 배포 시점에 모든 next-auth JWT cookie 무효화 (cookie name 변경 or 강제 만료)
- 사용자 재로그인 필요
- 사전 공지 채널: 동아리 Slack 또는 운영진 단톡
- AMANG 규모(~100명 동아리)에 자연스러운 방식. 공연 사이 비활성 기간이라 영향 최소

Grace period(양쪽 인식) 또는 자동 마이그레이션 endpoint는 구현 복잡도 대비 효익 없음.

### Capacitor 앱 (D4)

**Phase 1에서 설계만 cover, 실구현은 Phase 4 (별도 PR)** 채택.

- 본 ADR이 모바일 앱 transport 차이(Secure Storage + Authorization 헤더)를 설계 단계에서 명시
- 백엔드 API는 처음부터 양쪽(cookie / Bearer 헤더) 다 지원하도록 구현
- 실제 Capacitor 앱 도입 시점에 Phase 4 진행. 현재 우선순위 낮음

## 오픈 결정 (백엔드 영역)

### D5. 백엔드 endpoint 명세

**[오픈 결정 — 남승민 (백엔드 영역)]**

- `Set-Cookie` 형식 (도메인, path, SameSite, Secure, HttpOnly, Max-Age 정확한 값)
- `/auth/refresh` 응답: 새 토큰 body 반환 vs Set-Cookie only (Capacitor 앱 호환성 위해 양쪽 다 필요할 수 있음)
- `/auth/me` 응답 schema (`@repo/shared-types`에 새 타입 추가)
- 로그아웃 시 RT 무효화 시점 (DB delete 시점)
- Origin 검증 화이트리스트 (production / preview / localhost)

## Migration Plan

본 ADR이 Accepted 된 후 단계적 진행.

### Phase 1: 백엔드 cookie 발급 (남승민)

- [ ] D5 결정 사항 반영해 `/auth/login` 응답에 `Set-Cookie` 추가
- [ ] `/auth/refresh` 도 `Set-Cookie` (+ body는 옵션, Capacitor 대비)
- [ ] `/auth/logout` endpoint 추가 (cookie 삭제 + RT DB delete)
- [ ] `/auth/me` endpoint 추가
- [ ] AT 검증 미들웨어를 헤더/쿠키 양방향으로 수정
- [ ] CSRF 보호 (Origin 헤더 검증) 미들웨어
- [ ] `@repo/shared-types`에 새 schema 추가

### Phase 2: 프론트 next-auth 제거 (손장수)

- [ ] `AuthProvider` (React Context) + `useAuth` 훅 구현
- [ ] `apiClient` interceptor에 `refreshPromise` + `Web Locks API` 적용
- [ ] `useSession()` 사용처 모두 `useAuth()`로 마이그레이션
- [ ] `await auth()` 3곳을 middleware/cookie check로 대체 ([proxy.ts:11](../../../apps/web/proxy.ts#L11), [(admin)/layout.tsx:19](../../../apps/web/app/(admin)/layout.tsx#L19), [teams/create/page.tsx:20](../../../apps/web/app/(general)/(dark)/performances/[id]/teams/create/page.tsx#L20))
- [ ] `apps/web/auth.ts`, `apps/web/app/api/auth/[...nextauth]` 제거
- [ ] `next-auth`, `@auth/*` 의존성 제거

### Phase 3: 마이그레이션 (D3=A 결정 반영)

- [ ] 배포 전 동아리 Slack 공지 (재로그인 안내, 일시)
- [ ] 배포 시 next-auth cookie 무효화 (next-auth cookie name이 사라지므로 자동)
- [ ] 모니터링 (Sentry: refresh 실패율, 강제 로그아웃 빈도 24h)

### Phase 4: Capacitor 앱 (별도 PR, 우선순위 낮음)

- [ ] Secure Storage 어댑터
- [ ] Authorization Bearer 헤더 전송

## Consequences

### 긍정

- **Race condition 근본 해결** — refresh trigger source 단일화
- **Capacitor 포팅 대응** — cookie 의존 제거 (Phase 4)
- **소셜로그인 확장 용이** — 백엔드 Passport strategy 추가만으로 가능
- **디버깅 용이** — 토큰이 next-auth JWT 내부에 암호화되지 않음
- **레이어 단순화** — next-auth 추상화 제거, 직접적 fetch + cookie

### 부정

- **단발 마이그레이션 비용** — 모든 사용자 1회 강제 로그아웃 (D3=A)
- **CSRF 보호 직접 구현 필요** — next-auth가 일부 자동 처리하던 영역
- **소셜로그인 도입 시까지 OAuth 인프라 직접 구현** — 현재 미사용이라 영향 없음
- **인증 보안 책임 100% 자체** — next-auth의 community CVE 안전망 손실

## Alternatives Considered

### Alt-1. 서버사이드 grace period 30초 ([#444](https://github.com/skku-amang/main/pull/444))

- ✅ 작은 변경 (30줄)
- ❌ Root cause 미해결 — race 자체는 계속 발생, 흡수만 함
- ❌ 백엔드 설득 실패 (보안 trade-off에 대한 인식 차이)
- ❌ 본 ADR의 큰 그림과 무관한 throwaway

### Alt-2. 클라이언트사이드 single-flight 만 ([#506](https://github.com/skku-amang/main/issues/506))

- ✅ 빠른 ship (며칠), 백엔드 협업 불필요
- ✅ TokenManager + Web Locks 컴포넌트는 본 ADR에서도 재사용
- ❌ next-auth 안에서 JWT 콜백 refresh trigger overload — `update()` 시맨틱 모호
- ❌ 본 ADR 완료 시 일부 코드 throwaway

### Alt-3. next-auth 유지 + JWT 콜백 refresh 제거만

- ❌ next-auth 내부 동작에 의존한 hack — 미래 버전 업그레이드 위험
- ❌ Capacitor 포팅 대응 안 됨

## 참고 자료

- [#358](https://github.com/skku-amang/main/issues/358) — 본 ADR의 epic 이슈
- [Web Locks API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API)
- [RFC 9700 OAuth Security BCP](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics) — Refresh Token Rotation
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [SameSite cookies explained (web.dev)](https://web.dev/articles/samesite-cookies-explained)
