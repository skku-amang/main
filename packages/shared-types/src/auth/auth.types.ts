import { DetailedUser } from "../user/user.types"

export type SignUpResponse = {
  message: string
}

// =============================================================================
// ADR-0002 Cookie 기반 인증 schema
// =============================================================================
//
// 토큰(AT/RT)은 httpOnly cookie로만 전송됨 (Set-Cookie 헤더).
// 응답 body는 user 정보 또는 success indicator만 포함.
//
// 백엔드는 다음 endpoint를 구현:
// - POST /auth/login    → LoginResponse + Set-Cookie (AT, RT)
// - POST /auth/refresh  → RefreshResponse + Set-Cookie (새 AT, RT)
// - POST /auth/logout   → LogoutResponse + Set-Cookie (만료 처리)
// - GET  /auth/me       → MeResponse
//
// 모든 요청은 `credentials: 'include'` 필수.
// 백엔드는 Origin 헤더 검증 + SameSite=Lax cookie로 CSRF 보호.
//
// 관련: ADR-0002 (`docs/architecture/adr/0002-auth-cookie-migration.md`)

/**
 * Auth cookie 이름 (ADR-0002 D4).
 * 백엔드 Set-Cookie와 프론트 middleware presence 체크가 공유하는 SSOT.
 */
export const ACCESS_TOKEN_COOKIE = "accessToken"
export const REFRESH_TOKEN_COOKIE = "refreshToken"

/**
 * POST /auth/login 응답.
 * AT/RT는 Set-Cookie로만 전송 — body엔 토큰 값 없음.
 */
export type LoginResponse = {
  user: DetailedUser
}

/**
 * POST /auth/refresh 응답.
 * 새 AT/RT는 Set-Cookie로만 갱신 — body는 성공 표시.
 */
export type RefreshResponse = {
  success: true
}

/**
 * POST /auth/logout 응답.
 * Set-Cookie로 cookie 만료 처리. 백엔드는 RT를 DB에서 즉시 delete.
 */
export type LogoutResponse = {
  success: true
}

/**
 * GET /auth/me 응답.
 * 현재 로그인된 사용자 정보. 401이면 비로그인.
 */
export type MeResponse = {
  user: DetailedUser
}
