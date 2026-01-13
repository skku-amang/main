import type { Session } from "next-auth"
import NextAuth, { NextAuthConfig, User } from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { apiClient } from "@/lib/apiClient"
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
        email: {
          label: "Email",
          type: "email",
          autoComplete: "email",
          placeholder: "amang@example.com"
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "********"
        },
        sessions: { label: "Sessions", type: "text" },
        generationId: { label: "Generation", type: "text" },
        csrfToken: { label: "csrfToken", type: "hidden" },
        callbackUrl: { label: "callbackUrl", type: "hidden" }
      },
      /**
       * 로그인 또는 회원가입 시 호출되는 함수
       * @param credentials 유저가 입력한 로그인 정보
       * @returns `null`을 반환하면 로그인 실패, `object`를 반환하면 로그인 성공되어 `jwt` 콜백의 `user`으로 전달됨
       */
      authorize: async (credentials) => {
        const { name, nickname, email, generationId, sessions, password } =
          credentials as {
            id?: string
            name?: string
            nickname?: string
            email?: string
            generationId?: string
            sessions?: string
            password?: string
          }
        let parsedGenerationId: number | undefined
        let parsedSessions: number[] | undefined
        if (generationId) {
          parsedGenerationId = parseInt(generationId as string)
        }
        if (sessions) {
          parsedSessions =
            (sessions as string).split(",").map((s) => parseInt(s)) || []
        }

        if (name && nickname && sessions) {
          const userInfo = await CreateUserSchema.parseAsync({
            name,
            nickname,
            email,
            password,
            generationId: parsedGenerationId,
            sessions: parsedSessions
          })
          return signup({ ...userInfo })
        }
        const userInfo = await LoginUserSchema.parseAsync({
          email,
          password
        })
        return login({ ...userInfo })
      }
    })
  ],
  callbacks: {
    /**
     * 1. JWT 콜백은 토큰을 갱신하거나 생성하는 역할을 합니다.
     * @token 이전 JWT 토큰 (처음에는 빈 객체)
     * @user `authorize` 함수에서 반환한 유저 객체 (처음 로그인 시에만 존재)
     */
    jwt: async ({ token, user }) => {
      // 최초 로그인 시 user 존재
      if (user) {
        return {
          ...token,
          // User 정보 복사
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          nickname: user.nickname,
          isAdmin: user.isAdmin,
          // 토큰 정보 복사
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expiresIn: Date.now() + (user.expiresIn as number) * 1000
        }
      }

      // 백엔드 액세스 토큰 만료 여부 확인 (여유 시간 10초)
      if (token.expiresIn && Date.now() < (token.expiresIn as number) - 10000) {
        return token
      }

      // 토큰 갱신 시도
      try {
        const { accessToken, expiresIn } = await refreshAccessToken(
          token?.refreshToken as string
        )
        return {
          ...token,
          accessToken,
          expiresIn: Date.now() + expiresIn * 1000
        }
      } catch (error) {
        console.error("Error refreshing access token", error)
        return { ...token, error: "RefreshAccessTokenError" }
      }
    },
    /**
     * 2. 세션 콜백은 클라이언트에 반환되는 세션 객체를 구성합니다.
     * @session 기본 세션 객체 { user, expires }
     * @token jwt 콜백에서 반환한 토큰
     */
    session: async ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          image: token.image as string | null,
          nickname: token.nickname as string,
          isAdmin: token.isAdmin as boolean
        },
        accessToken: token.accessToken,
        error: token.error
      }
    }
  },
  debug: process.env.NODE_ENV === "development",
  trustHost: true
}

const nextAuth = NextAuth(authOptions)

export const handlers = nextAuth.handlers
export const signIn: typeof nextAuth.signIn = nextAuth.signIn
export const signOut = nextAuth.signOut
export const auth: () => Promise<Session | null> = nextAuth.auth

async function login({ email, password }: LoginUser) {
  console.log(
    "[auth] login attempt with API URL:",
    process.env.NEXT_PUBLIC_API_URL
  )
  try {
    const { user, accessToken, expiresIn, refreshToken } =
      await apiClient.login({
        email,
        password
      })
    return {
      id: user.id.toString(),
      name: user.name,
      nickname: user.nickname,
      email: user.email,
      isAdmin: user.isAdmin,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: expiresIn
    } as User
  } catch (error) {
    console.error("[auth] login error:", error)
    throw error
  }
}

async function signup({
  name,
  nickname,
  email,
  password,
  generationId,
  sessions
}: CreateUser) {
  const { user, accessToken, expiresIn, refreshToken } = await apiClient.signup(
    {
      name,
      nickname,
      email,
      password,
      generationId,
      sessions
    }
  )
  return {
    id: user.id.toString(),
    name: user.name,
    nickname: user.nickname,
    email: user.email,
    isAdmin: user.isAdmin,
    accessToken,
    refreshToken,
    expiresIn
  }
}

async function refreshAccessToken(refreshToken: string) {
  return apiClient.refreshToken(refreshToken)
}
