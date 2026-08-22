import { DetailedUser } from "../user/user.types"

export type SignUpResponse = {
  message: string
}

/**
 * Auth cookie 이름
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
 * GET /auth/me 응답.
 * 현재 로그인된 사용자 정보. 401이면 비로그인.
 */
export type MeResponse = {
  user: DetailedUser
}
