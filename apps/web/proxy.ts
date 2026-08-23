import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import ROUTES from "@/constants/routes"
import { isPreviewDeployment } from "@/lib/auth/previewDeployment"
import { ACCESS_TOKEN_COOKIE } from "@repo/shared-types"

/**
 * 보호 라우트 게이트 (ADR-0002).
 * Edge에서는 cookie 존재만 확인 — 토큰 유효성 검증(서명·만료)은 API가 담당.
 * cookie 수명이 RT TTL과 같으므로 presence ≈ 세션 존재.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    !isPreviewDeployment &&
    !req.cookies.has(ACCESS_TOKEN_COOKIE) &&
    pathname !== ROUTES.LOGIN
  ) {
    const url = req.nextUrl.clone()
    url.pathname = ROUTES.LOGIN
    url.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/performances/:id/teams/create",
    "/performances/:id/teams/:teamId/edit"
  ]
}
