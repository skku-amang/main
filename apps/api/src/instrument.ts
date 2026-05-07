import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { resourceFromAttributes } from "@opentelemetry/resources"
import { NodeSDK } from "@opentelemetry/sdk-node"
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_NAMESPACE,
  ATTR_SERVICE_VERSION
} from "@opentelemetry/semantic-conventions"
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_K8S_NAMESPACE_NAME,
  ATTR_K8S_POD_NAME
} from "@opentelemetry/semantic-conventions/incubating"

if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME ?? "amang-api",
      [ATTR_SERVICE_NAMESPACE]: "amang",
      [ATTR_SERVICE_VERSION]: process.env.IMAGE_TAG ?? "unknown",
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]:
        process.env.DEPLOYMENT_ENVIRONMENT ?? "production",
      [ATTR_K8S_NAMESPACE_NAME]: process.env.K8S_NAMESPACE ?? "",
      [ATTR_K8S_POD_NAME]: process.env.K8S_POD_NAME ?? ""
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
