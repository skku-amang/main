import { cookies } from "next/headers"

import { ApiResult } from "@repo/api-client"
import { DetailedUser } from "@repo/shared-types"

/**
 * RSC/서버 전용: 현재 로그인 사용자 조회 (ADR-0002).
 * 브라우저가 보낸 auth cookie를 백엔드 GET /auth/me로 전달한다.
 * 비로그인·만료 시 null — 서버에서는 refresh를 시도하지 않는다
 * (refresh는 클라이언트 ApiClient/TokenManager 단일 진입점).
 */
export async function getServerUser(): Promise<DetailedUser | null> {
  const cookieStore = await cookies()

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store"
  })

  if (!response.ok) return null

  const result = (await response.json()) as ApiResult<{ user: DetailedUser }>
  return result.isSuccess ? result.data.user : null
}
