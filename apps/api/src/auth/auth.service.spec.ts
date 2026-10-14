import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { Test, TestingModule } from "@nestjs/testing"
import {
  RefreshTokenExpiredError,
  RefreshTokenNotFoundError
} from "@repo/api-client"
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
  const otherLoginDto = { email: "other@g.skku.edu", password: PASSWORD }
  const sidOf = (token: string) => jwtService.decode<JwtPayload>(token).sid

  beforeEach(async () => {
    redis = new RedisMock()
    await redis.flushall()
    const password = await bcrypt.hash(PASSWORD, 4)
    const users = [
      { id: 1, email: loginDto.email, password, isApproved: true },
      { id: 2, email: otherLoginDto.email, password, isApproved: true }
    ]

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        AuthSessionStore,
        JwtService,
        { provide: REDIS_CLIENT, useValue: redis },
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: (email: string) =>
              Promise.resolve(users.find((u) => u.email === email) ?? null),
            findOneById: (id: number) =>
              Promise.resolve(users.find((u) => u.id === id) ?? null)
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
    ).rejects.toThrow(RefreshTokenExpiredError)
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

  it("서명이 틀린 이전 RT로는 세션을 지우지 않는다", async () => {
    const victim = await service.login(loginDto, {})
    const forged = jwtService.sign(
      { sub: 1, sid: sidOf(victim.refreshToken) },
      { secret: "wrong-secret" }
    )

    await service.login(loginDto, { previousRefreshToken: forged })

    await expect(
      service.refreshTokens(1, sidOf(victim.refreshToken), victim.refreshToken)
    ).resolves.toHaveProperty("refreshToken")
  })

  it("sid가 없는 배포 이전 RT는 세션 없음으로 처리해 재로그인시킨다", async () => {
    const legacy = jwtService.sign(
      { sub: 1 },
      { secret: env.REFRESH_TOKEN_SECRET }
    )

    await expect(
      service.refreshTokens(
        1,
        jwtService.decode<JwtPayload>(legacy).sid,
        legacy
      )
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

  it("user-agent는 512자까지만 저장한다", async () => {
    const login = await service.login(loginDto, {
      userAgent: "a".repeat(10_000)
    })

    const userAgent = await redis.hget(
      `user:1:auth-session:${sidOf(login.refreshToken)}`,
      "userAgent"
    )

    expect(userAgent).toHaveLength(512)
  })

  describe("로그인 기기 목록 (#668)", () => {
    it("내 기기만 보여주고 토큰 해시는 내보내지 않는다", async () => {
      const laptop = await service.login(loginDto, { userAgent: "laptop" })
      await service.login(loginDto, { userAgent: "phone" })
      await service.login(otherLoginDto, { userAgent: "someone-else" })

      const sessions = await service.listSessions(1, sidOf(laptop.refreshToken))

      expect(sessions.map((s) => s.userAgent).sort()).toEqual([
        "laptop",
        "phone"
      ])
      expect(sessions.every((s) => !("tokenHash" in s))).toBe(true)
    })

    it("현재 기기를 표시하고 맨 앞에 둔 뒤 최근 사용 순으로 정렬한다", async () => {
      const oldest = await service.login(loginDto, { userAgent: "oldest" })
      const middle = await service.login(loginDto, { userAgent: "middle" })
      const newest = await service.login(loginDto, { userAgent: "newest" })
      await redis.hset(`user:1:auth-session:${sidOf(oldest.refreshToken)}`, {
        lastUsedAt: "2026-01-01T00:00:00.000Z"
      })
      await redis.hset(`user:1:auth-session:${sidOf(middle.refreshToken)}`, {
        lastUsedAt: "2026-01-02T00:00:00.000Z"
      })
      await redis.hset(`user:1:auth-session:${sidOf(newest.refreshToken)}`, {
        lastUsedAt: "2026-01-03T00:00:00.000Z"
      })

      const sessions = await service.listSessions(1, sidOf(oldest.refreshToken))

      expect(sessions.map((s) => [s.userAgent, s.current])).toEqual([
        ["oldest", true],
        ["newest", false],
        ["middle", false]
      ])
    })

    it("다른 기기를 로그아웃하면 그 기기만 refresh가 막힌다", async () => {
      const laptop = await service.login(loginDto, {})
      const phone = await service.login(loginDto, {})

      await service.logout(1, sidOf(phone.refreshToken))

      await expect(
        service.refreshTokens(1, sidOf(phone.refreshToken), phone.refreshToken)
      ).rejects.toThrow(RefreshTokenNotFoundError)
      await expect(
        service.refreshTokens(
          1,
          sidOf(laptop.refreshToken),
          laptop.refreshToken
        )
      ).resolves.toHaveProperty("refreshToken")
    })

    it("다른 기기 모두 로그아웃하면 현재 기기만 남는다", async () => {
      const laptop = await service.login(loginDto, {})
      await service.login(loginDto, {})
      await service.login(loginDto, {})

      await service.logoutOtherSessions(1, sidOf(laptop.refreshToken))

      const sessions = await service.listSessions(1, sidOf(laptop.refreshToken))
      expect(sessions).toHaveLength(1)
      expect(sessions[0]).toMatchObject({
        sid: sidOf(laptop.refreshToken),
        current: true
      })
    })

    it("다른 사용자의 sid로 요청해도 그 사용자의 기기는 지워지지 않는다", async () => {
      const victim = await service.login(otherLoginDto, {})

      await service.logout(1, sidOf(victim.refreshToken))
      await service.logoutOtherSessions(1, "attacker-sid")

      await expect(
        service.refreshTokens(
          2,
          sidOf(victim.refreshToken),
          victim.refreshToken
        )
      ).resolves.toHaveProperty("refreshToken")
    })

    it("이미 없는 기기를 로그아웃해도 에러가 나지 않는다", async () => {
      await expect(service.logout(1, "missing-sid")).resolves.not.toThrow()
    })
  })
})
