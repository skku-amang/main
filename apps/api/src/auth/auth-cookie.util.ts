import { CookieOptions, Response } from "express"

/**
 * ADR-0002 D4 cookie 속성.
 *
 * - SameSite=Lax: web(amang.json-server.win)과 api(api.amang.json-server.win)는
 *   same-site(json-server.win)라 cross-subdomain 요청에도 전송됨.
 *   *.vercel.app preview는 cross-site라 미전송 — staging에서 검증.
 * - RT는 Path=/auth로 좁혀 일반 API 요청에 노출되지 않게 함.
 * - Domain 미지정(host-only): 모든 인증 요청이 api 호스트로만 가므로 충분.
 * - secure는 로컬 http 개발을 위해 production에서만 강제.
 */
export const ACCESS_TOKEN_COOKIE = "accessToken"
export const REFRESH_TOKEN_COOKIE = "refreshToken"

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax"
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  maxAgeSeconds: { accessToken: number; refreshToken: number }
): void {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseCookieOptions,
    path: "/",
    maxAge: maxAgeSeconds.accessToken * 1000
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
