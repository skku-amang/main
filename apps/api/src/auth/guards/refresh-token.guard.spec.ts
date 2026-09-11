import { ExecutionContext } from "@nestjs/common"
import { JsonWebTokenError, TokenExpiredError } from "@nestjs/jwt"
import {
  AuthError,
  RefreshTokenExpiredError,
  RefreshTokenNotFoundError
} from "@repo/api-client"
import { Response } from "express"
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../auth-cookie.util"
import { RefreshTokenGuard } from "./refresh-token.guard"

describe("RefreshTokenGuard", () => {
  const clearCookie = jest.fn()
  const res = { clearCookie } as unknown as Response

  const context = {
    switchToHttp: () => ({
      getRequest: () => ({ cookies: {} }),
      getResponse: () => res
    })
  } as unknown as ExecutionContext

  const guard = new RefreshTokenGuard()

  beforeEach(() => jest.clearAllMocks())

  // 갱신에 실패하면 세션은 복구 불가능하다. AT cookie를 남겨두면 다음 요청이
  // 다시 "갱신 가능한 만료"로 응답되어 무한 루프가 된다 (#629).
  describe.each([
    [
      "RT가 만료됐을 때",
      new TokenExpiredError("jwt expired", new Date()),
      RefreshTokenExpiredError
    ],
    ["RT가 없을 때", { message: "No auth token" }, RefreshTokenNotFoundError],
    ["RT 형식이 깨졌을 때", new JsonWebTokenError("invalid"), AuthError]
  ])("%s", (_label, info, expectedError) => {
    it("해당 인증 오류를 알린다", () => {
      expect(() => guard.handleRequest(null, null, info, context)).toThrow(
        expectedError
      )
    })

    it("남은 인증 cookie를 모두 지운다", () => {
      expect(() => guard.handleRequest(null, null, info, context)).toThrow()
      expect(clearCookie).toHaveBeenCalledWith(
        ACCESS_TOKEN_COOKIE,
        expect.objectContaining({ path: "/" })
      )
      expect(clearCookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_COOKIE,
        expect.objectContaining({ path: "/auth" })
      )
    })
  })

  it("검증에 성공하면 cookie를 지우지 않고 payload를 넘긴다", () => {
    const payload = { sub: 1, refreshToken: "rt" }

    expect(guard.handleRequest(null, payload, null, context)).toBe(payload)
    expect(clearCookie).not.toHaveBeenCalled()
  })
})
