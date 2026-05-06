import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { resourceFromAttributes } from "@opentelemetry/resources"
import { NodeSDK } from "@opentelemetry/sdk-node"
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_NAMESPACE
} from "@opentelemetry/semantic-conventions"

if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME ?? "amang-api",
      [ATTR_SERVICE_NAMESPACE]: "amang",
      "deployment.environment.name":
        process.env.DEPLOYMENT_ENVIRONMENT ?? "production"
    }),
    traceExporter: new OTLPTraceExporter(),
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false },
        "@opentelemetry/instrumentation-net": { enabled: false },
        "@opentelemetry/instrumentation-dns": { enabled: false },
        "@opentelemetry/instrumentation-http": {
          ignoreIncomingRequestHook: (req) =>
            req.url?.endsWith("/health") ?? false
        }
      })
    ]
  })

  sdk.start()
}
