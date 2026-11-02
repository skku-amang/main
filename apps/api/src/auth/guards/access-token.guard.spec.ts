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
import { IS_PUBLIC_KEY } from "../decorators/public.decorator"
import { AccessTokenGuard } from "./access-token.guard"

describe("AccessTokenGuard", () => {
  const clearCookie = jest.fn()
  const res = { clearCookie } as unknown as Response

  const privateHandler = () => undefined
  const publicHandler = () => undefined
  Reflect.defineMetadata(IS_PUBLIC_KEY, true, publicHandler)

  const contextWithCookies = (
    cookies: Record<string, string>,
    path = "/auth/me",
    handler: () => void = privateHandler
  ) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ cookies, path }),
        getResponse: () => res
      }),
      getHandler: () => handler,
      getClass: () => AccessTokenGuard
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

    // RT cookie는 Path=/auth라 그 밖의 경로에는 원래 전송되지 않는다. 여기서 "RT 없음"으로
    // 판단해 cookie를 지우면 멀쩡한 세션이 끊긴다 (#542)
    it("RT가 전송되지 않는 경로에서는 RT가 안 보여도 갱신 가능한 만료로 알리고 cookie를 지우지 않는다", () => {
      const context = contextWithCookies(
        { [ACCESS_TOKEN_COOKIE]: "expired-at" },
        "/notifications/unread-count"
      )

      expect(() =>
        guard.handleRequest(null, null, expiredInfo, context)
      ).toThrow(AccessTokenExpiredError)
      expect(clearCookie).not.toHaveBeenCalled()
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

  describe("공개 조회 API", () => {
    const publicContext = (cookies: Record<string, string>) =>
      contextWithCookies(cookies, "/teams/1", publicHandler)

    it("유효한 토큰이면 사용자 정보를 넘긴다", () => {
      const payload = { sub: 1 }

      expect(guard.handleRequest(null, payload, null, publicContext({}))).toBe(
        payload
      )
    })

    it("토큰이 없으면 비로그인으로 통과시킨다", () => {
      expect(
        guard.handleRequest(
          null,
          null,
          { message: "No auth token" },
          publicContext({})
        )
      ).toBeUndefined()
    })

    it("만료된 토큰이면 오류 없이 비로그인으로 통과시키고 cookie를 지우지 않는다", () => {
      expect(
        guard.handleRequest(
          null,
          null,
          expiredInfo,
          publicContext({ [ACCESS_TOKEN_COOKIE]: "expired-at" })
        )
      ).toBeUndefined()
      expect(clearCookie).not.toHaveBeenCalled()
    })

    it("형식이 깨진 토큰이면 비로그인으로 통과시킨다", () => {
      expect(
        guard.handleRequest(
          null,
          null,
          new JsonWebTokenError("invalid signature"),
          publicContext({ [ACCESS_TOKEN_COOKIE]: "garbage" })
        )
      ).toBeUndefined()
    })
  })
})
