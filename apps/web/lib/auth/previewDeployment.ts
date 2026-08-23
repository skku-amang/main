/**
 * Vercel preview 배포 여부 (ADR-0002 D4).
 *
 * preview 호스트는 `*.vercel.app`이라 staging API가 발급한 auth cookie
 * (`Domain=amang.staging.json-server.win`)의 스코프 밖이다. 로그인 자체는
 * `SameSite=None`으로 성공하지만, preview 자기 오리진으로 오는 요청에는
 * 브라우저가 그 cookie를 붙이지 않는다 — 즉 proxy(Edge)와 RSC는 세션을
 * 볼 방법이 없다.
 *
 * 그래서 preview에서는 서버측 인증 게이트를 건너뛰고 판정을 클라이언트
 * (`useAuth` → `/auth/me`, cookie 전송됨)에 맡긴다. 실제 권한 방어는 API의
 * JwtAuthGuard·AdminGuard가 하므로 이 우회로 열리는 것은 UI 껍데기뿐이고
 * 데이터 요청은 그대로 401/403을 받는다.
 */
export const isPreviewDeployment = process.env.VERCEL_ENV === "preview"
