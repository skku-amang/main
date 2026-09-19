import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
import * as Sentry from "@sentry/nestjs"
import { nodeProfilingIntegration } from "@sentry/profiling-node"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",

  tracesSampleRate: 1.0,
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
    if (typeof url === "string" && url.endsWith("/health")) {
      return null
    }
    return event
  }
})
