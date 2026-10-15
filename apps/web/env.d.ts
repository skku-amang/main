declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test"
    NEXT_PUBLIC_API_URL?: string // 백엔드 서버 주소
    NEXT_PUBLIC_VAPID_PUBLIC_KEY?: string // Web Push 공개키. 없으면 푸시 UI 비활성
    VERCEL_ENV?: "production" | "preview" | "development" // Vercel 자동 주입
  }
}
