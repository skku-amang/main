declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test"
    NEXT_PUBLIC_API_URL?: string // 백엔드 서버 주소
    VERCEL_ENV?: "production" | "preview" | "development" // Vercel 자동 주입
  }
}
