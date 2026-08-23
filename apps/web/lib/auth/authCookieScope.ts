/**
 * auth cookie가 도달할 수 없는 호스트인지 판정한다 (ADR-0002 D4).
 *
 * cookie는 `Domain=$COOKIE_DOMAIN`(prod `amang.json-server.win`, staging
 * `amang.staging.json-server.win`)으로 발급되므로, 그 스코프 밖인
 * `*.vercel.app` 호스트에는 브라우저가 cookie를 붙이지 않는다. 이런 곳에서는
 * proxy(Edge)·RSC가 세션을 볼 방법이 없어 서버측 게이트가 언제나 "비로그인"으로
 * 판정한다 — 로그인해도 보호 라우트가 /login으로 튕긴다.
 *
 * 그래서 해당 호스트에 한해 서버측 게이트를 건너뛰고 판정을 클라이언트
 * (`useAuth` → `/auth/me`, cookie 전송됨)에 맡긴다. 권한 방어는 API의
 * JwtAuthGuard·AdminGuard가 담당하므로 열리는 것은 UI 껍데기뿐이고 데이터
 * 요청은 그대로 401/403을 받는다.
 *
 * `VERCEL_ENV === "preview"` 단독으로 판정하지 않는다: staging은 preview 배포에
 * 커스텀 도메인을 alias한 형태([deploy-staging.yml](../../../../.github/workflows/deploy-staging.yml))라
 * `VERCEL_ENV`가 preview인데도 cookie 스코프 안이며, 게이트가 정상 동작해야 하는
 * 환경이다. production 배포의 `*.vercel.app` URL은 cookie 스코프 밖이지만
 * 우회 대상에서 제외해 노출면을 좁힌다.
 */
const VERCEL_PREVIEW_HOST_SUFFIX = ".vercel.app"

export function isAuthCookieBlindHost(
  host: string | null | undefined
): boolean {
  return (
    process.env.VERCEL_ENV !== "production" &&
    !!host?.endsWith(VERCEL_PREVIEW_HOST_SUFFIX)
  )
}
