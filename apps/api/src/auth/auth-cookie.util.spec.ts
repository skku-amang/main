import { Response } from "express"
import {
  ACCESS_TOKEN_COOKIE,
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies
} from "./auth-cookie.util"

describe("auth-cookie.util", () => {
  const res = {
    cookie: jest.fn(),
    clearCookie: jest.fn()
  } as unknown as Response

  beforeEach(() => jest.clearAllMocks())

  it("AT는 Path=/, RT는 Path=/auth로 httpOnly cookie를 설정한다", () => {
    setAuthCookies(
      res,
      { accessToken: "at", refreshToken: "rt" },
      { accessToken: 3600, refreshToken: 604800 }
    )

    expect(res.cookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      "at",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 3600 * 1000
      })
    )
    expect(res.cookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE,
      "rt",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/auth",
        maxAge: 604800 * 1000
      })
    )
  })

  it("clearAuthCookies는 두 cookie를 같은 path로 만료시킨다", () => {
    clearAuthCookies(res)

    expect(res.clearCookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      expect.objectContaining({ path: "/" })
    )
    expect(res.clearCookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE,
      expect.objectContaining({ path: "/auth" })
    )
  })
})
