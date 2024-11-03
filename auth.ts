import { StatusCodes } from "http-status-codes"
import NextAuth, { NextAuthConfig, User } from "next-auth"
import { JWT } from "next-auth/jwt"
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
import { isAccessTokenExpired } from "@/lib/auth/utils"
import fetchData from "@/lib/fetch"
import { AuthData } from "@/types/auth"

const authOptions: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        name: { label: "Name", type: "text" },
        nickname: { label: "Nickname", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        sessions: { label: "Sessions", type: "text" }
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
  const res = await fetchData(API_ENDPOINTS.AUTH.REFRESH as ApiEndpoint, {
    body: JSON.stringify({ refresh: prevToken.refresh }),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json"
    }
  })

  if (!res.ok) {
    switch (res.status) {
      // Refresh Token 만료
      case StatusCodes.UNAUTHORIZED:
        return null
      default:
        throw new InternalServerError()
    }
  }

  const data = await res.json()
  return {
    ...prevToken,
    access: data.access
  }
}

async function _signIn(
  type: "signup" | "login",
  body: z.infer<typeof signUpSchema> | z.infer<typeof signInSchema>
): Promise<User> {
  // 요청 전송
  const apiEndpoint =
    type === "signup" ? API_ENDPOINTS.AUTH.REGISTER : API_ENDPOINTS.AUTH.LOGIN
  throw new Error(`${apiEndpoint}`)
  // const res = await fetchData(apiEndpoint as ApiEndpoint, {
  //   body: JSON.stringify(body),
  //   cache: "no-store",
  //   headers: {
  //     "Content-Type": "application/json"
  //   }
  // })

  // // 에러 처리
  // if (!res.ok) {
  //   if (type === "signup") {
  //     switch (res.status) {
  //       case StatusCodes.BAD_REQUEST:
  //         throw new InvalidSignupCredentialsError()
  //       case StatusCodes.CONFLICT:
  //         throw new DuplicatedCredentialsError()
  //       default:
  //         throw new InternalServerError()
  //     }
  //   } else {
  //     switch (res.status) {
  //       case StatusCodes.UNAUTHORIZED:
  //         throw new InvalidSigninError()
  //       default:
  //         throw new InternalServerError()
  //     }
  //   }
  // }

  // // 결과 반환
  // const data = await res.json()
  // return { ...data } as AuthData
}
