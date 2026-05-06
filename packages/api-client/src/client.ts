/**
 * Hey API runtime configuration + 토큰 상태.
 * generated/client.gen.ts가 빌드 시점에 createClientConfig를 import하므로
 * 이 파일은 generated/* 를 import하면 안 됨 (순환 의존 회피).
 *
 * Interceptor 등록은 spec-client.ts에서 수행.
 */
import type { CreateClientConfig } from "./generated/client.gen"

// ─── 모듈 레벨 토큰 state ─────────────────────────────────────
let accessToken: string | null = null
let onTokenExpiredHandler: (() => Promise<string | null>) | null = null

export const setAccessToken = (token: string | null): void => {
  accessToken = token
}

export const getAccessToken = (): string | null => accessToken

export const setOnTokenExpired = (
  handler: () => Promise<string | null>
): void => {
  onTokenExpiredHandler = handler
}

// ─── Refresh 동시성 제어 ──────────────────────────────────────
// 여러 요청이 동시에 401 받으면 한 번만 refresh 호출하도록 promise 공유.
let refreshPromise: Promise<string | null> | null = null

export const refreshAccessToken = async (): Promise<string | null> => {
  const handler = onTokenExpiredHandler
  if (!handler) return null

  if (!refreshPromise) {
    refreshPromise = handler().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

// ─── Hey API client config ────────────────────────────────────
const getBaseUrl = (): string => {
  if (typeof window === "undefined") {
    return (
      process.env.AMANG_INTERNAL_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:8000"
    )
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
}

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: getBaseUrl(),
  credentials: "include",
  // 모든 요청에 Bearer 토큰 자동 부착.
  auth: () => accessToken ?? undefined
})
