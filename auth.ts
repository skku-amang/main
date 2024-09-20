import { StatusCodes } from "http-status-codes"
import NextAuth, { NextAuthConfig, User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import { signInSchema } from "@/constants/zodSchema"
import { signUpSchema } from "@/constants/zodSchema"
import {
  DuplicatedCredentialsError,
  InternalServerError,
  InvalidSigninError,
  InvalidSignupCredentialsError
} from "@/lib/auth/errors"
import fetchData from "@/lib/fetch"
import { AuthData } from "@/types/auth"

const authOptions: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      /**
       * 로그인 또는 회원가입 시 호출되는 함수
       * @param credentials 유저가 입력한 로그인 정보
       * @returns `null`을 반환하면 로그인 실패, `object`를 반환하면 로그인 성공되어 `jwt` 콜백의 `token`으로 전달됨
       */
      authorize: async (credentials) => {
        if (credentials.name) {
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
      // 토큰 없는 상태(로그인 X)에서 로그인 시도
      if (user?.email) {
        return { ...user }
      }

      return token
    },
    session: async ({ session, token }) => {
      return { ...session, ...token }
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)

async function _signIn(
  type: "signup" | "login",
  body: z.infer<typeof signUpSchema> | z.infer<typeof signInSchema>
): Promise<User> {
  // 요청 전송
  const apiEndpoint =
    type === "signup" ? API_ENDPOINTS.AUTH.REGISTER : API_ENDPOINTS.AUTH.LOGIN
  const res = await fetchData(apiEndpoint as ApiEndpoint, {
    body: JSON.stringify(body),
    cache: "no-store"
  })

  // 에러 처리
  if (!res.ok) {
    if (type === "signup") {
      switch (res.status) {
        case StatusCodes.BAD_REQUEST:
          throw new InvalidSignupCredentialsError()
        case StatusCodes.CONFLICT:
          throw new DuplicatedCredentialsError()
        default:
          throw new InternalServerError()
      }
    } else {
      switch (res.status) {
        case StatusCodes.UNAUTHORIZED:
          throw new InvalidSigninError()
        default:
          throw new InternalServerError()
      }
    }
  }

  // 결과 반환
  const data = (await res.json()).data as AuthData

  return {
    ...data
  }
}
