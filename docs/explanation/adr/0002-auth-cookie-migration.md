# ADR-0002: 인증 토큰 관리 — next-auth 제거 + 백엔드 cookie 발급

**작성일**: 2026-05-26
**상태**: Accepted
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

[apps/web/auth.ts:91-110](https://github.com/skku-amang/main/blob/265ee36a/apps/web/auth.ts#L91-L110)(당시 스냅샷 — 본 마이그레이션에서 파일 삭제됨)의 JWT 콜백이 자동 refresh를 포함. 이 콜백은 아래 5개 context에서 **독립적으로** 실행된다:

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

## Decision

### 핵심 원칙

> 인증 토큰 발급·검증·갱신을 **백엔드(NestJS)가 단독 책임**진다. 프론트는 httpOnly cookie를 통해 토큰을 운반하는 transport 역할만 한다. next-auth는 제거한다.

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
       ┌─────▼─────┐
       │ Web 브라우저 │
       │           │
       │ AT/RT     │
       │ httpOnly  │
       │ Cookie    │
       │           │
       │ React     │
       │ Context로 │
       │ user 정보 │
       └───────────┘
```

### 토큰 관리

| 항목        | 값                                                                       |
| ----------- | ------------------------------------------------------------------------ |
| AT 저장     | httpOnly cookie                                                          |
| RT 저장     | httpOnly cookie                                                          |
| AT 전달     | cookie 자동 전송                                                         |
| RT 전달     | cookie 자동 전송                                                         |
| CSRF        | **SameSite=Lax + Origin 검증**                                           |
| Cookie 속성 | `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age` (AT=1h, RT=7d) |

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

**일괄 강제 로그아웃** 채택. 공지 없음.

- 배포 시점에 모든 next-auth JWT cookie 무효화 (cookie name 변경 or 강제 만료)
- 사용자 재로그인 필요
- AMANG 규모(~100명 동아리) + 공연 사이 비활성 기간 + 재로그인 비용 무시 가능 수준 → 운영 ceremony 불필요

Grace period(양쪽 인식) 또는 자동 마이그레이션 endpoint는 구현 복잡도 대비 효익 없음.

## 오픈 결정 (백엔드 영역)

### D4. 백엔드 endpoint 명세

**[확정 — 손장수, 2026-07-21, PR #515 구현 기준]**

**Set-Cookie 형식**:

| Cookie         | 속성                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------- |
| `accessToken`  | `HttpOnly; Secure(prod); SameSite=Lax; Path=/; Max-Age=604800; Domain=$COOKIE_DOMAIN`     |
| `refreshToken` | `HttpOnly; Secure(prod); SameSite=Lax; Path=/auth; Max-Age=604800; Domain=$COOKIE_DOMAIN` |

- **AT cookie Max-Age = RT TTL(7d)**: cookie 수명과 JWT 유효성(1h)을 분리. 만료 AT는 401 → refresh 흐름을 타고, 프론트 middleware의 presence 체크가 세션 내내 유효. 토큰 유효성 판정은 항상 서버의 JWT exp 검증.
- **RT `Path=/auth`**: 일반 API 요청에 RT 미전송 — 노출면 최소화.
- **`Domain=$COOKIE_DOMAIN`** (prod `amang.json-server.win`, staging `amang.staging.json-server.win`, 로컬 미설정): host-only cookie는 api 서브도메인 전용이라 web 호스트의 middleware·RSC가 못 보므로 amang 스코프로 확장. `json-server.win` 전체가 아니라 타 서비스 미노출.
- **Vercel preview 로그인**: preview(`*.vercel.app`)는 staging API 기준 cross-site라 Lax cookie 미전송. **staging에만 `COOKIE_SAMESITE=none`** 적용해 로그인 허용 (None은 Secure 강제 동반, CSRF는 Origin 검증이 담당). production은 Lax 고정. 한계: Safari 등 3rd-party cookie 차단 브라우저에선 여전히 불가, preview의 Next middleware는 staging 도메인 cookie를 못 보므로 보호 라우트(/admin, /profile 등)는 로그인 상태여도 /login으로 튕김 — preview에서는 로그인 + 일반 화면·API 호출까지만 검증 가능.

**나머지 결정**:

- 토큰 추출: **cookie 전용** — 헤더(Bearer)/body 추출은 next-auth 제거로 소비 주체가 사라져 함께 제거 (2026-07-21 확정)
- 응답 body에 토큰 없음 — login `{ user }`(`LoginResponse`), refresh/logout은 body 없음 (성공 여부는 공통 응답 봉투 `isSuccess`가 SSOT). 전환기 병행 없이 일괄 전환 (사용자 수 적어 비용 무시 가능)
- `/auth/me` 응답: `MeResponse` (`@repo/shared-types`, `detailedUserSelector` 기반 — password 미포함)
- 로그아웃: 요청 즉시 RT DB delete + 두 cookie 만료
- Origin 검증 화이트리스트: CORS 허용 목록과 단일 상수 공유 (`apps/api/src/common/allowed-origins.ts`) — localhost 임의 포트 / production / staging / `*.vercel.app`

## Migration Plan

본 ADR이 Accepted 된 후 단계적 진행.

### Phase 1: 백엔드 cookie 발급 (남승민)

- [ ] D4 결정 사항 반영해 `/auth/login` 응답에 `Set-Cookie` 추가
- [ ] `/auth/refresh` 도 `Set-Cookie`
- [ ] `/auth/logout` endpoint 추가 (cookie 삭제 + RT DB delete)
- [ ] `/auth/me` endpoint 추가
- [ ] AT 검증 미들웨어를 헤더/쿠키 양방향으로 수정
- [ ] CSRF 보호 (Origin 헤더 검증) 미들웨어
- [ ] `@repo/shared-types`에 새 schema 추가

### Phase 2: 프론트 next-auth 제거 (손장수)

- [ ] `AuthProvider` (React Context) + `useAuth` 훅 구현
- [ ] `apiClient` interceptor에 `refreshPromise` + `Web Locks API` 적용
- [ ] `useSession()` 사용처 모두 `useAuth()`로 마이그레이션
- [ ] `await auth()` 3곳을 middleware/cookie check로 대체 ([proxy.ts:11](../../../apps/web/proxy.ts#L11), [(admin)/layout.tsx:19](<../../../apps/web/app/(admin)/layout.tsx#L19>), [teams/create/page.tsx:20](<../../../apps/web/app/(general)/(dark)/performances/[id]/teams/create/page.tsx#L20>))
- [ ] `apps/web/auth.ts`, `apps/web/app/api/auth/[...nextauth]` 제거
- [ ] `next-auth`, `@auth/*` 의존성 제거

### Phase 3: 마이그레이션 (D3=A 결정 반영)

- [ ] 배포 시 next-auth cookie 무효화 (next-auth cookie name이 사라지므로 자동)
- [ ] 모니터링 (Sentry: refresh 실패율, 강제 로그아웃 빈도 24h)

## Consequences

### 긍정

- **Race condition 근본 해결** — refresh trigger source 단일화
- **소셜로그인 확장 용이** — 백엔드 Passport strategy 추가만으로 가능
- **디버깅 용이** — 토큰이 next-auth JWT 내부에 암호화되지 않음
- **레이어 단순화** — next-auth 추상화 제거, 직접적 fetch + cookie

### 부정

- **단발 마이그레이션 비용** — 모든 사용자 1회 강제 로그아웃 (공지 없음, D3=A)
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

## 참고 자료

- [#358](https://github.com/skku-amang/main/issues/358) — 본 ADR의 epic 이슈
- [Web Locks API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API)
- [RFC 9700 OAuth Security BCP](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics) — Refresh Token Rotation
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [SameSite cookies explained (web.dev)](https://web.dev/articles/samesite-cookies-explained)
