import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@repo/shared-types"
import { CookieOptions, Response } from "express"

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE }

/**
 * ADR-0002 D4 cookie 속성.
 *
 * - SameSite=Lax: web(amang.json-server.win)과 api(api.amang.json-server.win)는
 *   same-site(json-server.win)라 cross-subdomain 요청에도 전송됨.
 *   *.vercel.app preview는 cross-site라 미전송 — staging에서 검증.
 * - RT는 Path=/auth로 좁혀 일반 API 요청에 노출되지 않게 함.
 * - Domain=COOKIE_DOMAIN (prod: amang.json-server.win): api 서브도메인이 발급한
 *   cookie를 web 호스트(Next middleware·RSC)에서도 볼 수 있게 함.
 *   json-server.win 전체가 아니라 amang 스코프라 타 서비스 미노출.
 *   로컬 개발은 미설정(host-only) — localhost는 포트 무관 공유됨.
 * - secure는 로컬 http 개발을 위해 production에서만 강제.
 * - AT cookie의 Max-Age는 RT TTL로 설정: JWT 만료(1h)와 cookie 수명을 분리해
 *   만료된 AT가 401 → refresh 흐름을 타게 하고, 프론트 middleware의
 *   presence 체크가 세션 지속 기간 내내 유효하게 함. 토큰 유효성은 항상
 *   서버의 JWT exp 검증이 결정.
 */
// COOKIE_SAMESITE=none은 staging 전용 — *.vercel.app preview(cross-site)에서
// 로그인 허용. None은 브라우저가 Secure를 강제하므로 secure도 함께 켠다.
// production은 Lax 고정 (CSRF 2중 방어 유지).
const sameSite = process.env.COOKIE_SAMESITE === "none" ? "none" : "lax"

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" || sameSite === "none",
  sameSite,
  ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN })
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  maxAgeSeconds: { accessToken: number; refreshToken: number }
): void {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseCookieOptions,
    path: "/",
    maxAge: maxAgeSeconds.refreshToken * 1000
  })
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions,
    path: "/auth",
    maxAge: maxAgeSeconds.refreshToken * 1000
  })
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { ...baseCookieOptions, path: "/" })
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    ...baseCookieOptions,
    path: "/auth"
  })
}
