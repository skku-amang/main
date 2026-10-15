declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test"
    API_URL?: string // 백엔드 서버 주소
    SENTRY_DSN?: string
    SENTRY_ENVIRONMENT?: string
    VAPID_PUBLIC_KEY?: string // Web Push 공개키. 없으면 푸시 UI 비활성
    VERCEL_ENV?: "production" | "preview" | "development" // Vercel 자동 주입
  }
}
