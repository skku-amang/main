import * as Sentry from "@sentry/nestjs"
import { nodeProfilingIntegration } from "@sentry/profiling-node"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",

  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,

  integrations: [nodeProfilingIntegration()],

  // 헬스체크 503은 Blackbox Exporter에서 모니터링하므로 Sentry 노이즈 방지 (API-4)
  beforeSend(event) {
    const url = event.request?.url ?? event.extra?.url
    if (typeof url === "string" && url.endsWith("/health")) {
      return null
    }
    return event
  }
})
