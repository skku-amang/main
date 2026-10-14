import * as Sentry from "@sentry/nextjs"

// replayIntegration은 브라우저 전용 — SSR에서 존재하지 않음
// 사용자 의견은 떠 있는 위젯 대신 /suggestions 페이지에서 Sentry.captureFeedback으로 수집
const integrations: ReturnType<typeof Sentry.getDefaultIntegrations>[number][] =
  [Sentry.captureConsoleIntegration({ levels: ["error", "warn"] })]

if (typeof window !== "undefined" && Sentry.replayIntegration) {
  integrations.push(Sentry.replayIntegration())
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  enabled: process.env.NODE_ENV === "production",

  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations
})
