// kubelet probe 대상(/health, /health/live 등). 트레이스 샘플링·요청 로그·Sentry 필터가 공유
export function isHealthCheckPath(url: string | undefined): boolean {
  if (!url) return false
  const path = new URL(url, "http://localhost").pathname
  return path === "/health" || path.startsWith("/health/")
}
