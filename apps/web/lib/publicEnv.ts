/**
 * 브라우저에 내려줘도 되는 런타임 설정.
 * NEXT_PUBLIC_*는 빌드 때 번들에 박혀 이미지 하나를 staging·production에 같이 못 쓴다 (#749).
 * 서버는 process.env를 읽고, 브라우저는 /env.js(app/env.js/route.ts)가 채운 window.__ENV를 읽는다.
 */
export interface PublicEnv {
  API_URL: string
  SENTRY_DSN?: string
  SENTRY_ENVIRONMENT?: string
  VAPID_PUBLIC_KEY: string // 없으면 푸시 UI 비활성
}

declare global {
  interface Window {
    __ENV?: PublicEnv
  }
}

export function readPublicEnvFromProcess(): PublicEnv {
  return {
    API_URL: process.env.API_URL || "http://localhost:8000",
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY ?? ""
  }
}

export const publicEnv: PublicEnv =
  typeof window === "undefined"
    ? readPublicEnvFromProcess()
    : (window.__ENV ?? readPublicEnvFromProcess())
