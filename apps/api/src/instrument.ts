import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
import * as Sentry from "@sentry/nestjs"
import { nodeProfilingIntegration } from "@sentry/profiling-node"
import { isHealthCheckPath } from "./health/health-path"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",

  // kubelet probe(5~10초 주기)는 루트에서 샘플링 제외 → 하위 Nest·Prisma 스팬까지 함께 빠짐
  tracesSampler: ({ normalizedRequest, inheritOrSampleWith }) => {
    if (isHealthCheckPath(normalizedRequest?.url)) return 0
    return inheritOrSampleWith(1.0)
  },
  profilesSampleRate: 1.0,
  enableLogs: true,

  integrations: [nodeProfilingIntegration(), Sentry.pinoIntegration()],

  // Sentry가 만든 OTel 스팬을 Tempo(OTel Collector 경유)로도 복제 전송
  openTelemetrySpanProcessors: process.env.OTEL_EXPORTER_OTLP_ENDPOINT
    ? [new BatchSpanProcessor(new OTLPTraceExporter())]
    : [],

  // 헬스체크 503은 Blackbox Exporter에서 모니터링하므로 Sentry 노이즈 방지 (API-4)
  beforeSend(event) {
    const url = event.request?.url ?? event.extra?.url
    if (typeof url === "string" && isHealthCheckPath(url)) {
      return null
    }
    return event
  }
})
