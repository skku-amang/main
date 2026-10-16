import { isHealthCheckPath } from "../health/health-path"

/** 스테이징 트래픽 봇(k6)의 트레이스 샘플링 비율. 에러는 샘플링 대상이 아니라 그대로 100% */
export const BOT_TRACE_SAMPLE_RATE = 0.05

type SampledRequest = {
  url?: string
  headers?: Record<string, string | string[] | undefined>
}

/**
 * kubelet probe는 0 → 하위 Nest·Prisma 스팬까지 함께 빠진다.
 * k6 봇(30분마다 ~55 요청, 요청당 스팬 ~20개)은 5%만 — 스테이징 Performance 화면이 봇으로 덮이지 않게.
 * 나머지는 상위 트레이스를 따르고, 없으면 100%.
 */
export function traceSampleRate(
  request: SampledRequest | undefined,
  inheritOrSampleWith: (fallback: number) => number
): number {
  if (isHealthCheckPath(request?.url)) return 0
  const header = request?.headers?.["user-agent"]
  const userAgent = Array.isArray(header) ? header[0] : header
  if (userAgent?.startsWith("k6/")) return BOT_TRACE_SAMPLE_RATE
  return inheritOrSampleWith(1.0)
}
