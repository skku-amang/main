import * as Sentry from "@sentry/nextjs"

import { publicEnv } from "@/lib/publicEnv"

// replayIntegration/feedbackIntegration은 브라우저 전용 — SSR에서 존재하지 않음
const integrations: ReturnType<typeof Sentry.getDefaultIntegrations>[number][] =
  [Sentry.captureConsoleIntegration({ levels: ["error", "warn"] })]

if (typeof window !== "undefined" && Sentry.replayIntegration) {
  integrations.push(Sentry.replayIntegration())
  integrations.push(
    // 기본 떠 있는 버튼은 하단 탭바를 가려서 끄고, 드래그 가능한 SuggestionButton이 폼을 연다
    Sentry.feedbackIntegration({
      autoInject: false,
      colorScheme: "system",
      showName: false,
      showEmail: false,
      formTitle: "의견 보내기",
      submitButtonLabel: "보내기",
      cancelButtonLabel: "취소",
      messageLabel: "내용",
      messagePlaceholder:
        "버그, 불편한 점, 바라는 점, 칭찬 무엇이든 알려주세요.",
      successMessageText: "보내주셔서 고마워요!",
      isRequiredLabel: "(필수)",
      addScreenshotButtonLabel: "스크린샷 첨부",
      removeScreenshotButtonLabel: "스크린샷 삭제"
    })
  )
}

Sentry.init({
  dsn: publicEnv.SENTRY_DSN,
  environment: publicEnv.SENTRY_ENVIRONMENT,
  enabled: process.env.NODE_ENV === "production",

  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations
})
