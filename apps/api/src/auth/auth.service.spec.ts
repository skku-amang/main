import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { Test, TestingModule } from "@nestjs/testing"
import { RefreshTokenNotFoundError } from "@repo/api-client"
import { JwtPayload } from "@repo/shared-types"
import * as bcrypt from "bcrypt"
import RedisMock from "ioredis-mock"
import { REDIS_CLIENT } from "../redis/redis.module"
import { UsersService } from "../users/users.service"
import { AuthSessionStore } from "./auth-session.store"
import { AuthService } from "./auth.service"

const PASSWORD = "password"
const env: Record<string, string> = {
  ACCESS_TOKEN_SECRET: "access-secret",
  REFRESH_TOKEN_SECRET: "refresh-secret",
  ACCESS_TOKEN_EXPIRES_IN_SECONDS: "3600",
  REFRESH_TOKEN_EXPIRES_IN_SECONDS: "604800"
}

describe("AuthService", () => {
  let service: AuthService
  let jwtService: JwtService
  let redis: InstanceType<typeof RedisMock>

  const loginDto = { email: "member@g.skku.edu", password: PASSWORD }
  const sidOf = (token: string) => jwtService.decode<JwtPayload>(token).sid

  beforeEach(async () => {
    redis = new RedisMock()
    await redis.flushall()
    const user = {
      id: 1,
      email: loginDto.email,
      password: await bcrypt.hash(PASSWORD, 4),
      isApproved: true
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        AuthSessionStore,
        JwtService,
        { provide: REDIS_CLIENT, useValue: redis },
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: () => Promise.resolve(user),
            findOneById: () => Promise.resolve(user)
          }
        },
        {
          provide: ConfigService,
          useValue: { get: (key: string) => env[key] }
        }
      ]
    }).compile()

    service = module.get(AuthService)
    jwtService = module.get(JwtService)
  })

  afterEach(() => redis.disconnect())

  it("다른 기기에서 로그인해도 기존 기기의 refresh가 유지된다 (#541)", async () => {
    const laptop = await service.login(loginDto, { userAgent: "laptop" })
    const phone = await service.login(loginDto, { userAgent: "phone" })

    await expect(
      service.refreshTokens(1, sidOf(laptop.refreshToken), laptop.refreshToken)
    ).resolves.toHaveProperty("refreshToken")
    await expect(
      service.refreshTokens(1, sidOf(phone.refreshToken), phone.refreshToken)
    ).resolves.toHaveProperty("refreshToken")
  })

  it("refresh 후 sid는 유지되고 교체 전 RT는 거부된다", async () => {
    const login = await service.login(loginDto, {})
    const sid = sidOf(login.refreshToken)
    // 같은 초에 서명하면 JWT가 동일해지므로 iat가 달라지도록 기다린다
    await new Promise((resolve) => setTimeout(resolve, 1100))

    const refreshed = await service.refreshTokens(1, sid, login.refreshToken)

    expect(sidOf(refreshed.refreshToken)).toBe(sid)
    await expect(
      service.refreshTokens(1, sid, login.refreshToken)
    ).rejects.toThrow()
  })

  it("로그아웃하면 그 기기만 끊기고 다른 기기는 유지된다", async () => {
    const laptop = await service.login(loginDto, {})
    const phone = await service.login(loginDto, {})

    await service.logout(1, sidOf(laptop.refreshToken))

    await expect(
      service.refreshTokens(1, sidOf(laptop.refreshToken), laptop.refreshToken)
    ).rejects.toThrow(RefreshTokenNotFoundError)
    await expect(
      service.refreshTokens(1, sidOf(phone.refreshToken), phone.refreshToken)
    ).resolves.toHaveProperty("refreshToken")
  })

  it("로그아웃 없이 같은 브라우저에서 재로그인하면 이전 세션을 지운다", async () => {
    const first = await service.login(loginDto, {})

    await service.login(loginDto, { previousRefreshToken: first.refreshToken })

    await expect(
      service.refreshTokens(1, sidOf(first.refreshToken), first.refreshToken)
    ).rejects.toThrow(RefreshTokenNotFoundError)
  })

  it("세션에 기기 정보와 시각을 남긴다", async () => {
    const login = await service.login(loginDto, { userAgent: "iPhone Safari" })

    const session = await redis.hgetall(
      `user:1:auth-session:${sidOf(login.refreshToken)}`
    )

    expect(session).toMatchObject({ userAgent: "iPhone Safari" })
    expect(session.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(session.lastUsedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
