import { Test, TestingModule } from "@nestjs/testing"
import { Request, Response } from "express"
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "./auth-cookie.util"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"

describe("AuthController", () => {
  let controller: AuthController

  const tokens = { accessToken: "at", refreshToken: "rt", expiresIn: 3600 }
  const ttls = { accessToken: 3600, refreshToken: 604800 }
  const user = { id: 1, name: "홍길동" }

  const authService = {
    signUp: jest.fn(),
    login: jest.fn().mockResolvedValue({ ...tokens, user }),
    logout: jest.fn(),
    refreshTokens: jest.fn().mockResolvedValue(tokens),
    tokenTtls: jest.fn().mockReturnValue(ttls),
    me: jest.fn().mockResolvedValue(user)
  }

  const makeRes = (): Response =>
    ({ cookie: jest.fn(), clearCookie: jest.fn() }) as unknown as Response

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  it("login은 Set-Cookie(AT, RT)와 legacy body를 함께 반환한다", async () => {
    const res = makeRes()
    const result = await controller.login(
      { email: "a@b.c", password: "pw" },
      res
    )

    expect(res.cookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      "at",
      expect.objectContaining({ httpOnly: true })
    )
    expect(res.cookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE,
      "rt",
      expect.objectContaining({ path: "/auth" })
    )
    expect(result).toEqual({ ...tokens, user })
  })

  it("refresh는 새 토큰을 Set-Cookie로 갱신한다", async () => {
    const res = makeRes()
    const req = {
      user: { sub: 1, refreshToken: "old-rt" }
    } as unknown as Request

    await controller.refreshTokens(req, res)

    expect(authService.refreshTokens).toHaveBeenCalledWith(1, "old-rt")
    expect(res.cookie).toHaveBeenCalledTimes(2)
  })

  it("logout은 두 cookie를 만료시킨다", async () => {
    const res = makeRes()
    const req = { user: { sub: 1 } } as unknown as Request

    await controller.logout(req, res)

    expect(authService.logout).toHaveBeenCalledWith(1)
    expect(res.clearCookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      expect.anything()
    )
    expect(res.clearCookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE,
      expect.anything()
    )
  })

  it("me는 현재 사용자 정보를 반환한다", async () => {
    const req = { user: { sub: 1 } } as unknown as Request

    await expect(controller.me(req)).resolves.toEqual({ user })
    expect(authService.me).toHaveBeenCalledWith(1)
  })
})
