"use client"

/**
 * Refresh 요청을 single-flight로 처리.
 *
 * 단일 탭: `ApiClient.refreshPromise` 싱글톤이 처리 (이미 구현됨).
 * 멀티 탭: `navigator.locks` (Web Locks API) — 모든 탭에서 한 번만 실행.
 *
 * Cookie 기반 인증이라 토큰 값 자체는 보관하지 않음.
 * httpOnly cookie가 운반. TokenManager는 refresh 호출 순서만 관리.
 *
 * 관련: ADR-0002 (`docs/explanation/adr/0002-auth-cookie-migration.md`)
 */

import { apiClient } from "@/lib/apiClient"

const LOCK_NAME = "auth-refresh"
const STORAGE_KEY_LAST_REFRESH = "auth.lastRefresh"
const SKIP_THRESHOLD_MS = 10_000
const NETWORK_RETRY_DELAY_MS = 1_000

export class TokenManager {
  private static instance: TokenManager | null = null

  static getInstance(): TokenManager {
    if (!this.instance) this.instance = new TokenManager()
    return this.instance
  }

  async refresh(): Promise<void> {
    return navigator.locks.request(LOCK_NAME, async () => {
      const lastRefresh = Number(
        localStorage.getItem(STORAGE_KEY_LAST_REFRESH) ?? "0"
      )
      if (Date.now() - lastRefresh < SKIP_THRESHOLD_MS) return

      await refreshWithNetworkRetry()

      localStorage.setItem(STORAGE_KEY_LAST_REFRESH, String(Date.now()))
    })
  }
}

/**
 * 응답을 받기 전에 끊기면(fetch가 TypeError) 한 번 더 보낸다. 서버가 이미 RT를
 * 교체했어도 30초 동안은 직전 RT를 인정하므로 같은 cookie로 재시도해도 된다 (#542).
 */
async function refreshWithNetworkRetry() {
  try {
    await apiClient.refreshSession()
  } catch (error) {
    if (!(error instanceof TypeError)) throw error
    await new Promise((resolve) => setTimeout(resolve, NETWORK_RETRY_DELAY_MS))
    await apiClient.refreshSession()
  }
}
