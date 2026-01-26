declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test"
    AUTH_SECRET: string
    NEXT_PUBLIC_API_URL?: string // 백엔드 서버 주소
  }
}
