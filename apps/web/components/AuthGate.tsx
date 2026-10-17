"use client"

import { Loader2 } from "lucide-react"
import { ReactNode, useEffect } from "react"

import ROUTES from "@/constants/routes"
import { useAuth } from "@/lib/providers/auth-provider"

/**
 * 서버(RSC)는 만료된 AT를 갱신하지 않으므로(ADR-0002) 서버에서 사용자를 못 찾았을 때
 * 바로 /login으로 보내지 않고, 클라이언트의 /auth/me(만료 시 refresh 포함) 결과로 판정한다 (#828).
 * 판정이 끝나기 전에는 children을 렌더하지 않는다.
 */
export default function AuthGate({
  requireAdmin = false,
  children
}: {
  requireAdmin?: boolean
  children: ReactNode
}) {
  const { user, isLoading } = useAuth()
  const isAllowed = !!user && (!requireAdmin || user.isAdmin)

  useEffect(() => {
    if (isLoading || isAllowed) return

    if (user) {
      window.location.replace(ROUTES.HOME)
      return
    }

    const callbackUrl = `${window.location.pathname}${window.location.search}`
    window.location.replace(
      `${ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(callbackUrl)}`
    )
  }, [isLoading, isAllowed, user])

  if (!isAllowed) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return children
}
