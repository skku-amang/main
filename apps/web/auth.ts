import type { User } from "next-auth"
import NextAuth, { NextAuthConfig } from "next-auth"
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
        const { name, nickname, email, generationId, sessionIds, password } =
          credentials as {
            name?: string
            nickname?: string
            email?: string
            generationId?: string
            sessionIds?: string
            password?: string
          }
        let parsedGenerationId: number | undefined
        let parsedSessions: number[] | undefined
        if (generationId) {
          parsedGenerationId = parseInt(generationId as string)
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
          access: user.access,
          refresh: user.refresh
        }
      }

      return token
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

async function login({ email, password }: LoginUser): Promise<User> {
  const { accessToken, refreshToken, user } = await apiClient.login({
    email,
    password
  })
  const { id, ...rest } = user
  return {
    access: accessToken,
    refresh: refreshToken,
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
  sessionIds
}: CreateUser): Promise<User> {
  const { accessToken, refreshToken, user } = await apiClient.signup({
    name,
    nickname,
    email,
    password,
    generationId,
    sessionIds
  })
  const { id, ...rest } = user
  return {
    ...rest,
    access: accessToken,
    refresh: refreshToken,
    id: id.toString()
  }
}
