import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { RuntimeNodeInstrumentation } from "@opentelemetry/instrumentation-runtime-node"
import { detectResources, envDetector } from "@opentelemetry/resources"
import {
  MeterProvider,
  PeriodicExportingMetricReader
} from "@opentelemetry/sdk-metrics"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
import * as Sentry from "@sentry/nestjs"
import { nodeProfilingIntegration } from "@sentry/profiling-node"
import { traceSampleRate } from "./common/trace-sampling"
import { isHealthCheckPath } from "./health/health-path"

Sentry.init({
  // kubelet probe 0, 스테이징 k6 봇 5%, 나머지 100% (common/trace-sampling.ts)
  tracesSampler: ({ normalizedRequest, inheritOrSampleWith }) =>
    traceSampleRate(normalizedRequest, inheritOrSampleWith),
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

// 이벤트 루프 지연·GC·힙은 프로세스 안에서만 잴 수 있다. OTel Collector를 거쳐 Prometheus로 보낸다
if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  const meterProvider = new MeterProvider({
    resource: detectResources({ detectors: [envDetector] }),
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: 15_000
      })
    ]
  })
  new RuntimeNodeInstrumentation().setMeterProvider(meterProvider)
}
