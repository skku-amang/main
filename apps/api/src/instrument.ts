import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { registerInstrumentations } from "@opentelemetry/instrumentation"
import { resourceFromAttributes } from "@opentelemetry/resources"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node"
import * as Sentry from "@sentry/nestjs"
import {
  SentryPropagator,
  SentrySampler,
  wrapContextManagerClass
} from "@sentry/opentelemetry"
import { nodeProfilingIntegration } from "@sentry/profiling-node"

const SentryContextManager = wrapContextManagerClass(
  AsyncLocalStorageContextManager
)

// ADR-0001: traces는 OTel Collector 경유로 Sentry+Tempo 양쪽 fan-out.
// Sentry SDK는 errors / profiling / replay-feedback만 담당.
const sentryClient = Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",

  skipOpenTelemetrySetup: true,

  profilesSampleRate: 1.0,

  integrations: [nodeProfilingIntegration()],

  beforeSend(event) {
    const url = event.request?.url ?? event.extra?.url
    if (typeof url === "string" && url.endsWith("/health")) {
      return null
    }
    return event
  }
})

if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  const provider = new NodeTracerProvider({
    sampler: sentryClient ? new SentrySampler(sentryClient) : undefined,
    resource: resourceFromAttributes({
      "service.name": process.env.OTEL_SERVICE_NAME ?? "amang-api",
      "service.namespace": "amang",
      "deployment.environment.name":
        process.env.DEPLOYMENT_ENVIRONMENT ?? "production"
    }),
    spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())]
  })

  provider.register({
    propagator: new SentryPropagator(),
    contextManager: new SentryContextManager()
  })

  registerInstrumentations({
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false },
        "@opentelemetry/instrumentation-net": { enabled: false },
        "@opentelemetry/instrumentation-dns": { enabled: false }
      })
    ]
  })
}
