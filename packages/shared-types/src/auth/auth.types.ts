import { User } from "@repo/database"

type AuthUser = Omit<User, "password" | "hashedRefreshToken">

export type AuthResponse = {
  accessToken: string
  //Refresh Token은 쿠키를 통해 전달됩니다.
  user: AuthUser
}

export type RefreshTokenResponse = {
  accessToken: string
}

export type LogoutResponse = {
  message: string
}
