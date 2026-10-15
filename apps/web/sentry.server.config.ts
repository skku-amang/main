import * as Sentry from "@sentry/nextjs"

import { publicEnv } from "@/lib/publicEnv"

Sentry.init({
  dsn: publicEnv.SENTRY_DSN,
  environment: publicEnv.SENTRY_ENVIRONMENT,
  enabled: process.env.NODE_ENV === "production",

  tracesSampleRate: 1.0
})
