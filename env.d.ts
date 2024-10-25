declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
    AUTH_SECRET: string
    NEXT_PUBLIC_CLIENT_URL?: string
    NEXT_PUBLIC_SERVER_URL?: string
    NEXT_PUBLIC_DEPLOY_URL?: string
  }
}