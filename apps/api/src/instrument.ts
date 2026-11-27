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
import type { Request } from "express"
import { nodeProfilingIntegration } from "@sentry/profiling-node"
import { traceSampleRate } from "./common/trace-sampling"
import { isHealthCheckPath } from "./health/health-path"

// Sentry가 service.version을 SDK 버전으로 덮어써서(getSentryResource) 배포 버전은 app.version으로 남긴다.
// Sentry 트레이스와 OTel 지표 둘 다 초기화 때 OTEL_RESOURCE_ATTRIBUTES를 읽으므로 그 전에 덧붙인다
if (process.env.APP_VERSION) {
  process.env.OTEL_RESOURCE_ATTRIBUTES = [
    process.env.OTEL_RESOURCE_ATTRIBUTES,
    `app.version=${process.env.APP_VERSION}`
  ]
    .filter(Boolean)
    .join(",")
}

Sentry.init({
  // kubelet probe 0, 스테이징 k6 봇 5%, 나머지 100% (common/trace-sampling.ts)
  tracesSampler: ({ normalizedRequest, inheritOrSampleWith }) =>
    traceSampleRate(normalizedRequest, inheritOrSampleWith),
  profilesSampleRate: 1.0,
  enableLogs: true,

  integrations: [
    Sentry.httpIntegration({
      // Sentry는 서버 스팬 이름을 URL 경로(GET /teams/91)로 짓고 Sentry로 보낼 때만 라우트로 바꾼다.
      // Tempo로 복제되는 OTel 스팬도 라우트 이름으로 맞춘다. Sentry가 스팬을 끝내는 close 리스너보다 먼저 등록된다
      incomingRequestSpanHook: (span, request, response) => {
        response.once("close", () => {
          const route = (request as Request).route?.path
          if (route) span.updateName(`${request.method} ${route}`)
        })
      }
    }),
    nodeProfilingIntegration(),
    Sentry.pinoIntegration()
  ],

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
