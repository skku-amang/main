import NextAuth, { NextAuthConfig, User } from "next-auth"
import { JWT } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"

import { apiClient } from "@/lib/apiClient"
import { isAccessTokenExpired } from "@/lib/auth/utils"
import { AuthError, ValidationError } from "@repo/api-client"
import {
  CreateUser,
  CreateUserSchema,
  LoginUser,
  LoginUserSchema
} from "@repo/shared-types"

const authOptions: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        name: { label: "Name", type: "text" },
        nickname: { label: "Nickname", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        sessionIds: { label: "Sessions", type: "text" },
        generationId: { label: "Generation", type: "text" },
        csrfToken: { label: "csrfToken", type: "hidden" },
        callbackUrl: { label: "callbackUrl", type: "hidden" }
      },
      /**
       * 로그인 또는 회원가입 시 호출되는 함수
       * @param credentials 유저가 입력한 로그인 정보
       * @returns `null`을 반환하면 로그인 실패, `object`를 반환하면 로그인 성공되어 `jwt` 콜백의 `token`으로 전달됨
       */
      authorize: async (credentials) => {
        console.log("credentials", credentials)
        const { name, nickname, email, generationId, sessionIds, password } =
          credentials
        let parsedGenerationId: number | undefined
        let parsedSessions: number[] | undefined
        if (generationId) {
          parsedGenerationId = parseInt(generationId as string, 10)
        }
        if (sessionIds) {
          parsedSessions =
            (sessionIds as string).split(",").map((s) => parseInt(s)) || []
        }

        if (name && nickname && sessionIds) {
          const userInfo = await CreateUserSchema.parseAsync({
            name,
            nickname,
            email,
            password,
            generationId: parsedGenerationId,
            sessionIds: parsedSessions
          })
          return _signIn({ type: "signup", body: userInfo })
        }
        const userInfo = await LoginUserSchema.parseAsync({
          email,
          password
        })
        return _signIn({ type: "login", body: userInfo })
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
          isAdmin: user.isAdmin,
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

async function _signIn({
  type,
  body
}:
  | {
      type: "signup"
      body: CreateUser
    }
  | {
      type: "login"
      body: LoginUser
    }): Promise<User> {
  let result: User
  if (type === "signup") {
    try {
      const { accessToken, refreshToken, ...user } =
        await apiClient.signup(body)
      result = { ...user, access: accessToken, refresh: refreshToken }
      console.log("result for signup:", result)
    } catch (error) {
      if (error instanceof ValidationError) {
        // TODO: 에러 처리
        console.error("Validation error:", error)
      }
      return null
    }
  } else {
    try {
      const { accessToken, refreshToken, ...user } = await apiClient.login(body)
      result = { ...user, access: accessToken, refresh: refreshToken }
      console.log("result for login:", result)
    } catch (error) {
      if (error instanceof AuthError) {
        // TODO: 에러 처리
        console.error("Authentication error:", error)
      }
      return null
    }
  }

  return result
}
