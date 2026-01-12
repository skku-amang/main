/* eslint-disable @typescript-eslint/no-empty-object-type */
export declare module "next-auth" {
  /**
   * `authorize` 함수 호출 시 반환하는 유저 객체의 타입
   */
  interface User extends UserInfo, AuthExtras, AuthTokens {}

  /**
   * 클라이언트 컴포넌트에서 `useSession` 훅을 통해 접근하는 세션 객체의 타입
   * 클라이언트에서 접근 가능
   */
  interface Session {
    user: UserInfo & AuthExtras
    accessToken: string
    error?: "RefreshAccessTokenError"
  }
}

export declare module "next-auth/jwt" {
  /**
   * 서버 측 인증/갱신
   * 클라이언트에서 접근 불가능 (HttpOnly 쿠키)
   */
  interface JWT extends UserInfo, AuthExtras, AuthTokens {}
}

/**
 * 기본 필드: NextAuth.js 표준
 */
interface UserInfo {
  id: string
  name: string
  email: string
  image?: string | null
}

/**
 * 추가 필드: 아망 홈페이지 전용
 */
interface AuthExtras {
  nickname: string
  isAdmin: boolean
}

/**
 * 인증 토큰 정보
 */
interface AuthTokens {
  accessToken: string
  refreshToken: string // 파싱 되어 Session이 아니라 JWT에만 저장됨
  expiresIn: number // 만료 시점 (Timestamp, ms)
  error?: "RefreshAccessTokenError"
}
