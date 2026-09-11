import { ExecutionContext } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { JsonWebTokenError, TokenExpiredError } from "@nestjs/jwt"
import {
  AccessTokenExpiredError,
  AccessTokenNotFoundError,
  AuthError
} from "@repo/api-client"
import { Response } from "express"
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../auth-cookie.util"
import { AccessTokenGuard } from "./access-token.guard"

describe("AccessTokenGuard", () => {
  const clearCookie = jest.fn()
  const res = { clearCookie } as unknown as Response

  const contextWithCookies = (cookies: Record<string, string>) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ cookies }),
        getResponse: () => res
      })
    }) as unknown as ExecutionContext

  const guard = new AccessTokenGuard(new Reflector())
  const expiredInfo = new TokenExpiredError("jwt expired", new Date())

  beforeEach(() => jest.clearAllMocks())

  describe("AT가 만료됐을 때", () => {
    it("RT cookie가 남아 있으면 갱신 가능한 만료로 알린다", () => {
      const context = contextWithCookies({
        [ACCESS_TOKEN_COOKIE]: "expired-at",
        [REFRESH_TOKEN_COOKIE]: "rt"
      })

      expect(() =>
        guard.handleRequest(null, null, expiredInfo, context)
      ).toThrow(AccessTokenExpiredError)
    })

    // RT가 없으면 refresh로 복구할 수 없다. 이때도 만료로 알리면 프론트가
    // refresh → 실패 → /login 재이동을 무한 반복한다 (#629).
    it("RT cookie가 없으면 갱신 불가능한 인증 실패로 알린다", () => {
      const context = contextWithCookies({
        [ACCESS_TOKEN_COOKIE]: "expired-at"
      })

      expect(() =>
        guard.handleRequest(null, null, expiredInfo, context)
      ).toThrow(AuthError)
    })

    it("RT cookie가 없으면 복구 불가능한 AT cookie를 지운다", () => {
      const context = contextWithCookies({
        [ACCESS_TOKEN_COOKIE]: "expired-at"
      })

      expect(() =>
        guard.handleRequest(null, null, expiredInfo, context)
      ).toThrow(AuthError)
      expect(clearCookie).toHaveBeenCalledWith(
        ACCESS_TOKEN_COOKIE,
        expect.objectContaining({ path: "/" })
      )
    })

    it("RT cookie가 있으면 cookie를 지우지 않는다", () => {
      const context = contextWithCookies({
        [ACCESS_TOKEN_COOKIE]: "expired-at",
        [REFRESH_TOKEN_COOKIE]: "rt"
      })

      expect(() =>
        guard.handleRequest(null, null, expiredInfo, context)
      ).toThrow(AccessTokenExpiredError)
      expect(clearCookie).not.toHaveBeenCalled()
    })
  })

  it("토큰이 아예 없으면 미인증으로 알린다", () => {
    expect(() =>
      guard.handleRequest(
        null,
        null,
        { message: "No auth token" },
        contextWithCookies({})
      )
    ).toThrow(AccessTokenNotFoundError)
  })

  it("형식이 깨진 토큰은 인증 오류로 알린다", () => {
    expect(() =>
      guard.handleRequest(
        null,
        null,
        new JsonWebTokenError("invalid signature"),
        contextWithCookies({ [ACCESS_TOKEN_COOKIE]: "garbage" })
      )
    ).toThrow(AuthError)
  })

  it("검증에 성공하면 payload를 그대로 넘긴다", () => {
    const payload = { sub: 1 }

    expect(
      guard.handleRequest(null, payload, null, contextWithCookies({}))
    ).toBe(payload)
  })
})
