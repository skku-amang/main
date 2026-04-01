import * as Sentry from "@sentry/nextjs"

// replayIntegration/feedbackIntegration은 브라우저 전용 — SSR에서 존재하지 않음
const integrations = []

if (typeof window !== "undefined" && Sentry.replayIntegration) {
  integrations.push(Sentry.replayIntegration())
  integrations.push(
    Sentry.feedbackIntegration({
      colorScheme: "system",
      triggerLabel: "버그 제보",
      formTitle: "버그 제보",
      submitButtonLabel: "보내기",
      cancelButtonLabel: "취소",
      nameLabel: "이름",
      namePlaceholder: "이름을 입력해주세요",
      emailLabel: "이메일",
      emailPlaceholder: "이메일을 입력해주세요",
      messageLabel: "설명",
      messagePlaceholder: "어떤 문제가 있었나요?",
      successMessageText: "버그 제보가 완료되었습니다. 감사합니다!",
      isRequiredLabel: "(필수)"
    })
  )
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",

  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations
})
