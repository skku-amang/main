import { User } from "@repo/database"

type AuthUser = Omit<User, "password" | "hashedRefreshToken">

/**
 * 인증 응답(RFC 6749 기준)
 * https://datatracker.ietf.org/doc/html/rfc6749#appendix-A
 * snake_case가 표준이지만 편의를 위해 camelCase 사용
 */
export type AuthResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: AuthUser // 비표준, 편의를 위해 추가된 필드
}

export type RefreshTokenResponse = {
  accessToken: string
  expiresIn: number
}

export type LogoutResponse = {
  message: string
}
