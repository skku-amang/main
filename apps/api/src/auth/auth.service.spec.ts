import { ConfigService } from "@nestjs/config"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { JwtService } from "@nestjs/jwt"
import { Test, TestingModule } from "@nestjs/testing"
import {
  AuthError,
  ConflictError,
  NotFoundError,
  RefreshTokenExpiredError,
  RefreshTokenNotFoundError,
  ValidationError
} from "@repo/api-client"
import { JwtPayload } from "@repo/shared-types"
import * as bcrypt from "bcrypt"
import RedisMock from "ioredis-mock"
import { EmailCodeService } from "../email-verification/email-code.service"
import { Mail, MailService } from "../email-verification/mail.service"
import { REDIS_CLIENT } from "../redis/redis.module"
import { USER_EVENTS, UserSignedUpEvent } from "../users/users.events"
import { UsersService } from "../users/users.service"
import { AuthSessionStore } from "./auth-session.store"
import { AuthService } from "./auth.service"
import { PasswordResetTokenStore } from "./password-reset-token.store"

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
  let emit: jest.Mock
  let outbox: Mail[]

  const loginDto = { email: "member@g.skku.edu", password: PASSWORD }
  const otherLoginDto = { email: "other@g.skku.edu", password: PASSWORD }
  const sidOf = (token: string) => jwtService.decode<JwtPayload>(token).sid

  beforeEach(async () => {
    redis = new RedisMock()
    await redis.flushall()
    emit = jest.fn()
    outbox = []
    const password = await bcrypt.hash(PASSWORD, 4)
    const users = [
      {
        id: 1,
        email: loginDto.email,
        nickname: "member1",
        password,
        isApproved: true,
        emailVerifiedAt: new Date() as Date | null
      },
      {
        id: 2,
        email: otherLoginDto.email,
        nickname: "taken",
        password,
        isApproved: true,
        emailVerifiedAt: null as Date | null
      }
    ]

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        AuthSessionStore,
        PasswordResetTokenStore,
        JwtService,
        EmailCodeService,
        {
          provide: MailService,
          useValue: { send: async (mail: Mail) => void outbox.push(mail) }
        },
        { provide: REDIS_CLIENT, useValue: redis },
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: (email: string) =>
              Promise.resolve(users.find((u) => u.email === email) ?? null),
            findOneById: (id: number) =>
              Promise.resolve(users.find((u) => u.id === id) ?? null),
            create: async ({ nickname }: { nickname: string }) => {
              if (users.some((u) => u.nickname === nickname))
                throw new ConflictError("이미 사용중인 닉네임입니다.")
              return { id: 3 }
            },
            setPassword: async (id: number, newPassword: string) => {
              users.find((u) => u.id === id)!.password = await bcrypt.hash(
                newPassword,
                4
              )
            }
          }
        },
        {
          provide: ConfigService,
          useValue: { get: (key: string) => env[key] }
        },
        { provide: EventEmitter2, useValue: { emit } }
      ]
    }).compile()

    service = module.get(AuthService)
    jwtService = module.get(JwtService)
  })

  afterEach(() => redis.disconnect())

  const signupDto = {
    email: "new@g.skku.edu",
    password: PASSWORD,
    name: "홍길동",
    nickname: "gil",
    generationId: 1,
    sessions: []
  }
  const sentCode = () => outbox.at(-1)!.subject.match(/\d{6}/)![0]

  it("가입 신청이 저장되면 user.signed_up을 발행한다 (#790)", async () => {
    await service.requestSignupEmailCode(signupDto.email)
    await service.signUp({ ...signupDto, emailCode: sentCode() })

    expect(emit).toHaveBeenCalledWith(
      USER_EVENTS.SIGNED_UP,
      new UserSignedUpEvent(3)
    )
  })

  it("메일 인증번호가 틀리면 가입되지 않는다 (#528)", async () => {
    await service.requestSignupEmailCode(signupDto.email)
    const wrong = sentCode() === "000000" ? "111111" : "000000"

    await expect(
      service.signUp({ ...signupDto, emailCode: wrong })
    ).rejects.toBeInstanceOf(ValidationError)
    expect(emit).not.toHaveBeenCalled()
  })

  it("가입이 저장된 뒤 인증번호 삭제가 실패해도 가입은 끝난다 (#528)", async () => {
    await service.requestSignupEmailCode(signupDto.email)
    const code = sentCode()
    jest.spyOn(redis, "del").mockRejectedValueOnce(new Error("redis down"))

    await expect(
      service.signUp({ ...signupDto, emailCode: code })
    ).resolves.toBeUndefined()
    expect(emit).toHaveBeenCalledWith(
      USER_EVENTS.SIGNED_UP,
      new UserSignedUpEvent(3)
    )
  })

  it("가입한 뒤에는 같은 인증번호를 다시 쓸 수 없다 (#528)", async () => {
    await service.requestSignupEmailCode(signupDto.email)
    const code = sentCode()
    await service.signUp({ ...signupDto, emailCode: code })

    await expect(
      service.signUp({ ...signupDto, emailCode: code })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it("저장이 실패하면(닉네임 중복) 같은 인증번호로 다시 가입할 수 있다 (#528)", async () => {
    await service.requestSignupEmailCode(signupDto.email)
    const code = sentCode()

    await expect(
      service.signUp({ ...signupDto, nickname: "taken", emailCode: code })
    ).rejects.toBeInstanceOf(ConflictError)
    await expect(
      service.signUp({ ...signupDto, emailCode: code })
    ).resolves.toBeUndefined()
  })

  it("이미 가입된 이메일로는 가입 인증번호를 보내지 않는다 (#528)", async () => {
    await expect(
      service.requestSignupEmailCode(loginDto.email)
    ).rejects.toBeInstanceOf(ConflictError)
    expect(outbox).toHaveLength(0)
  })

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

  describe("RT 교체 (#542)", () => {
    // Date만 가짜로 돌린다. JWT iat도 이 시계를 따르므로 초를 넘기면 서로 다른 RT가 서명된다
    const start = new Date("2026-10-16T01:00:00Z").getTime()
    const at = (seconds: number) => jest.setSystemTime(start + seconds * 1000)

    beforeEach(() => {
      jest.useFakeTimers({
        doNotFake: [
          "nextTick",
          "setImmediate",
          "setTimeout",
          "setInterval",
          "queueMicrotask"
        ]
      })
      at(0)
    })
    afterEach(() => jest.useRealTimers())

    it("refresh 후 sid는 유지된다", async () => {
      const login = await service.login(loginDto, {})
      const sid = sidOf(login.refreshToken)
      at(1)

      const refreshed = await service.refreshTokens(1, sid, login.refreshToken)

      expect(sidOf(refreshed.refreshToken)).toBe(sid)
    })

    it("교체 응답을 못 받은 기기가 30초 안에 직전 RT로 재시도하면 통과한다", async () => {
      const a = await service.login(loginDto, {})
      const sid = sidOf(a.refreshToken)
      at(1)
      await service.refreshTokens(1, sid, a.refreshToken) // 응답 유실

      at(30)
      await expect(
        service.refreshTokens(1, sid, a.refreshToken)
      ).resolves.toHaveProperty("refreshToken")
    })

    it("교체 후 30초가 지나면 직전 RT는 거부된다", async () => {
      const a = await service.login(loginDto, {})
      const sid = sidOf(a.refreshToken)
      at(1)
      await service.refreshTokens(1, sid, a.refreshToken)

      at(32)
      await expect(
        service.refreshTokens(1, sid, a.refreshToken)
      ).rejects.toThrow(RefreshTokenExpiredError)
    })

    it("직전 RT는 한 번만 통한다", async () => {
      const a = await service.login(loginDto, {})
      const sid = sidOf(a.refreshToken)
      at(1)
      await service.refreshTokens(1, sid, a.refreshToken)
      at(2)
      await service.refreshTokens(1, sid, a.refreshToken)

      at(3)
      await expect(
        service.refreshTokens(1, sid, a.refreshToken)
      ).rejects.toThrow(RefreshTokenExpiredError)
    })

    it("두 번 전 RT는 30초 안이어도 거부된다", async () => {
      const a = await service.login(loginDto, {})
      const sid = sidOf(a.refreshToken)
      at(1)
      const b = await service.refreshTokens(1, sid, a.refreshToken)
      at(2)
      await service.refreshTokens(1, sid, b.refreshToken)

      at(3)
      await expect(
        service.refreshTokens(1, sid, a.refreshToken)
      ).rejects.toThrow(RefreshTokenExpiredError)
    })

    it("배포 전에 만든 세션(직전 RT 필드 없음)도 현재 RT로 refresh된다", async () => {
      const login = await service.login(loginDto, {})
      const key = `user:1:auth-session:${sidOf(login.refreshToken)}`
      await redis.hdel(key, "prevTokenHash", "rotatedAt")
      at(1)

      await expect(
        service.refreshTokens(1, sidOf(login.refreshToken), login.refreshToken)
      ).resolves.toHaveProperty("refreshToken")
    })
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

  describe("비밀번호 찾기 (#528)", () => {
    const NEW_PASSWORD = "NewPass123!"

    it("인증된 회원은 메일 인증번호로 비밀번호를 바꾸고, 다른 기기는 로그아웃된다", async () => {
      const before = await service.login(loginDto, {})

      await service.requestPasswordReset(loginDto.email)
      await service.resetPasswordWithCode({
        email: loginDto.email,
        code: sentCode(),
        newPassword: NEW_PASSWORD
      })

      await expect(service.login(loginDto, {})).rejects.toBeInstanceOf(
        AuthError
      )
      await expect(
        service.login({ ...loginDto, password: NEW_PASSWORD }, {})
      ).resolves.toHaveProperty("accessToken")
      await expect(
        service.refreshTokens(
          1,
          sidOf(before.refreshToken),
          before.refreshToken
        )
      ).rejects.toBeInstanceOf(RefreshTokenNotFoundError)
    })

    it("인증 안 된 회원과 없는 이메일에는 메일을 보내지 않는다", async () => {
      await service.requestPasswordReset(otherLoginDto.email)
      await service.requestPasswordReset("nobody@g.skku.edu")

      expect(outbox).toHaveLength(0)
    })

    it("운영진 링크는 한 번만 쓸 수 있다", async () => {
      const { token } = await service.createPasswordResetLink(2)

      await service.resetPasswordWithToken({
        token,
        newPassword: NEW_PASSWORD
      })
      await expect(
        service.login({ ...otherLoginDto, password: NEW_PASSWORD }, {})
      ).resolves.toHaveProperty("accessToken")
      await expect(
        service.resetPasswordWithToken({ token, newPassword: "Other123!" })
      ).rejects.toBeInstanceOf(ValidationError)
    })

    it("없는 회원에게는 링크를 만들지 않는다", async () => {
      await expect(service.createPasswordResetLink(999)).rejects.toBeInstanceOf(
        NotFoundError
      )
    })
  })
})
