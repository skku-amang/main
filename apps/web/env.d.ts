declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test"
    BETTER_AUTH_SECRET: string
    BETTER_AUTH_URL: string
    GITHUB_CLIENT_ID: string
    GITHUB_CLIENT_SECRET: string
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
    NEXT_PUBLIC_DEVELOPMENT_URL?: string // 개발환경에서의 백엔드 서버 주소
    NEXT_PUBLIC_DEPLOY_URL?: string // 배포환경에서의 백엔드 서버 주소
  }
}
