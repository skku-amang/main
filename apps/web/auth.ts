import NextAuth, { NextAuthConfig, User } from "next-auth"
import { JWT } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"

import { signInSchema, signUpSchema } from "@/constants/zodSchema"
import { isAccessTokenExpired } from "@/lib/auth/utils"
import { apiClient } from "@/lib/providers/api-client-provider"
import { AuthError, ValidationError } from "@repo/api-client"
import { CreateUser, LoginUser } from "@repo/shared-types"

const authOptions: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        name: { label: "Name", type: "text" },
        nickname: { label: "Nickname", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        sessions: { label: "Sessions", type: "text" },
        generationId: { label: "Generation", type: "text" }
      },
      /**
       * 로그인 또는 회원가입 시 호출되는 함수
       * @param credentials 유저가 입력한 로그인 정보
       * @returns `null`을 반환하면 로그인 실패, `object`를 반환하면 로그인 성공되어 `jwt` 콜백의 `token`으로 전달됨
       */
      authorize: async (credentials) => {
        if (credentials.name && credentials.nickname && credentials.sessions) {
          credentials.sessions = (credentials.sessions as string)
            .split(",")
            .map((s) => +s)
          const userInfo = await signUpSchema.parseAsync(credentials)
          return _signIn("signup", userInfo)
        }
        const userInfo = await signInSchema.parseAsync(credentials)
        return _signIn("login", userInfo)
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      // 토큰 없는 상태(로그인 X)에서 로그인 시도 -> 토큰에 저장
      if (user?.email) {
        return {
          id: user.id,
          name: user.name,
          nickname: user.nickname,
          image: user.image,
          email: user.email,
          position: user.position,
          is_admin: user.isAdmin,
          access: user.access,
          refresh: user.refresh
        }
      }

      // 토큰 정상
      if (!isAccessTokenExpired(token.access)) {
        return token
      }

      // 액세스 토큰이 만료된 -> 리프레시 토큰을 사용하여 새로운 액세스 토큰 발급
      const refreshedTokenOrNull = await refreshAccessToken(token)
      return refreshedTokenOrNull
    },
    session: async ({ session, token }) => {
      return { ...session, ...token }
    }
  },
  debug: process.env.NODE_ENV === "development",
  trustHost: true
}

export const {
  handlers,
  signIn,
  signOut,
  auth,
  unstable_update: update
} = NextAuth(authOptions)

async function refreshAccessToken(prevToken: JWT) {
  const res = apiClient.refreshToken(
    prevToken.userId as string,
    prevToken.refresh as string
  )
  return {
    ...prevToken,
    access: (await res).accessToken
  }
}

async function _signIn(
  type: "signup" | "login",
  body: LoginUser | CreateUser
): Promise<User> {
  let result: User
  if (type === "signup") {
    try {
      result = await apiClient.signup(body as CreateUser)
    } catch (error) {
      if (error instanceof ValidationError) {
        // TODO: 에러 처리
        console.error("Validation error:", error)
      }
      throw error
    }
  } else {
    try {
      result = await apiClient.login(body)
    } catch (error) {
      if (error instanceof AuthError) {
        // TODO: 에러 처리
        console.error("Authentication error:", error)
      }
      throw error
    }
  }

  return result
}
