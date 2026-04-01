import * as Sentry from "@sentry/nestjs"
import { nodeProfilingIntegration } from "@sentry/profiling-node"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",

  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,

  integrations: [nodeProfilingIntegration()]
})
