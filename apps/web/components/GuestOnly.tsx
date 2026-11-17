"use client"

import { useSearchParams } from "next/navigation"
import { ReactNode, useEffect } from "react"

import ROUTES from "@/constants/routes"
import { useAuth } from "@/lib/providers/auth-provider"

/**
 * 로그인 후 돌아갈 경로. 앱 내부 경로가 아니거나 로그인 페이지 자신이면 홈으로 보낸다.
 * `/login`을 그대로 받으면 로그인 직후 다시 로그인 페이지로 돌아간다.
 */
const resolveCallbackUrl = (raw: string | null) => {
  if (!raw?.startsWith("/") || raw.startsWith("//")) return ROUTES.HOME
  if (raw === ROUTES.LOGIN || raw.startsWith(`${ROUTES.LOGIN}?`)) {
    return ROUTES.HOME
  }
  return raw
}

interface Props {
  /** 서버에서 본 로그인 cookie 유무. 없으면 확인을 기다리지 않고 바로 보여준다 */
  hasSessionCookie: boolean
  children: ReactNode
}

/**
 * 로그인하지 않은 사람만 보는 화면 (로그인·회원가입, #952).
 * 로그인돼 있으면 `callbackUrl`로, 없으면 홈으로 보낸다.
 *
 * proxy에서 하지 않는 이유: proxy는 cookie가 있는지만 본다. 비밀번호 변경 등으로 세션만 끝나고
 * cookie가 남은 기기를 내보내면 보호 화면 → 401 → 로그인 → 다시 보호 화면으로 갇힌다.
 * 그래서 내 정보 조회가 성공했을 때만 보낸다.
 */
export const GuestOnly = ({ hasSessionCookie, children }: Props) => {
  const searchParams = useSearchParams()
  const { isLoading, isAuthenticated } = useAuth()

  // 클라이언트 이동(router.push)은 금지. 로그아웃 상태에서 prefetch된 보호 경로는
  // proxy의 /login redirect가 Router Cache에 남아 있어, 그 캐시를 타고 다시 로그인 페이지로 돌아온다.
  // 전체 이동으로 캐시를 버리고 새 cookie로 판정받는다. replace라 뒤로 가기로 폼에 돌아오지 않는다
  useEffect(() => {
    if (!isAuthenticated) return
    window.location.replace(resolveCallbackUrl(searchParams.get("callbackUrl")))
  }, [isAuthenticated, searchParams])

  if (isAuthenticated || (hasSessionCookie && isLoading)) return null
  return children
}
