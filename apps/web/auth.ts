import type { User } from "next-auth"
import NextAuth, { NextAuthConfig, NextAuthResult } from "next-auth"
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
       * @returns `null`을 반환하면 로그인 실패, `object`를 반환하면 로그인 성공되어 `jwt` 콜백의 `token`으로 전달됨
       */
      authorize: async (credentials) => {
        const { name, nickname, email, generationId, sessions, password } =
          credentials as {
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
    // TODO: user 타입이 소셜 인증 사용시 사용되는 `AdapterUser`인 경우 고려
    jwt: async ({ token, user }) => {
      if (user?.email) {
        return {
          id: user.id,
          name: user.name,
          nickname: user.nickname,
          image: user.image,
          email: user.email,
          isAdmin: user.isAdmin,
          access: user.access
        }
      }

      return token
    }
  },
  debug: process.env.NODE_ENV === "development",
  trustHost: true
}

const nextAuthResult: NextAuthResult = NextAuth(authOptions)

export const handlers: NextAuthResult["handlers"] = nextAuthResult.handlers
export const signIn: NextAuthResult["signIn"] = nextAuthResult.signIn
export const signOut: NextAuthResult["signOut"] = nextAuthResult.signOut
export const auth: NextAuthResult["auth"] = nextAuthResult.auth
export const update: NextAuthResult["unstable_update"] =
  nextAuthResult.unstable_update

async function login({ email, password }: LoginUser): Promise<User> {
  const { accessToken, user } = await apiClient.login({
    email,
    password
  })
  const { id, ...rest } = user
  return {
    access: accessToken,
    id: id.toString(),
    ...rest
  }
}

async function signup({
  name,
  nickname,
  email,
  password,
  generationId,
  sessions
}: CreateUser): Promise<User> {
  const { accessToken, user } = await apiClient.signup({
    name,
    nickname,
    email,
    password,
    generationId,
    sessions
  })
  const { id, ...rest } = user
  return {
    ...rest,
    access: accessToken,
    id: id.toString()
  }
}
