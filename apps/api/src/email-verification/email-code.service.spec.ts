import { ConfigService } from "@nestjs/config"
import { Test } from "@nestjs/testing"
import { UnprocessableEntityError, ValidationError } from "@repo/api-client"
import RedisMock from "ioredis-mock"
import { REDIS_CLIENT } from "../redis/redis.module"
import { EmailCodeService } from "./email-code.service"
import { Mail, MailService } from "./mail.service"

const EMAIL = "member@example.com"

describe("EmailCodeService", () => {
  let service: EmailCodeService
  let redis: InstanceType<typeof RedisMock>
  let outbox: Mail[]
  let env: Record<string, string>

  const lastCode = () => outbox.at(-1)!.subject.match(/\d{6}/)![0]

  beforeEach(async () => {
    redis = new RedisMock()
    await redis.flushall()
    outbox = []
    env = {}

    const module = await Test.createTestingModule({
      providers: [
        EmailCodeService,
        { provide: REDIS_CLIENT, useValue: redis },
        {
          provide: MailService,
          useValue: { send: async (mail: Mail) => void outbox.push(mail) }
        },
        { provide: ConfigService, useValue: { get: (key: string) => env[key] } }
      ]
    }).compile()

    service = module.get(EmailCodeService)
  })

  it("보낸 인증번호로 한 번만 확인된다", async () => {
    await service.issue("verify", EMAIL)
    const code = lastCode()

    await expect(service.verify("verify", EMAIL, code)).resolves.toBeUndefined()
    await expect(service.verify("verify", EMAIL, code)).rejects.toBeInstanceOf(
      ValidationError
    )
  })

  it("용도가 다르면 같은 번호라도 통과하지 않는다", async () => {
    await service.issue("signup", EMAIL)

    await expect(
      service.verify("verify", EMAIL, lastCode())
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it("다섯 번 틀리면 맞는 번호도 더는 통과하지 않는다", async () => {
    await service.issue("verify", EMAIL)
    const code = lastCode()
    const wrong = code === "000000" ? "111111" : "000000"

    for (let i = 0; i < 5; i++) {
      await expect(
        service.verify("verify", EMAIL, wrong)
      ).rejects.toBeInstanceOf(ValidationError)
    }
    await expect(service.verify("verify", EMAIL, code)).rejects.toBeInstanceOf(
      ValidationError
    )
  })

  it("60초 안에 다시 요청하면 거절한다", async () => {
    await service.issue("verify", EMAIL)

    await expect(service.issue("verify", EMAIL)).rejects.toBeInstanceOf(
      UnprocessableEntityError
    )
  })

  it("한 이메일로 한 시간에 다섯 번까지만 보낸다", async () => {
    for (let i = 0; i < 5; i++) {
      await service.issue("verify", EMAIL)
      await redis.del(`email-code-cooldown:verify:${EMAIL}`)
    }

    await expect(service.issue("verify", EMAIL)).rejects.toBeInstanceOf(
      UnprocessableEntityError
    )
  })

  it("이메일 대소문자가 달라도 같은 주소로 본다", async () => {
    await service.issue("verify", "Member@Example.com")

    await expect(
      service.verify("verify", EMAIL, lastCode())
    ).resolves.toBeUndefined()
  })

  describe("스테이징 시험 도메인", () => {
    beforeEach(() => {
      env.MAIL_TEST_DOMAIN = "bot.test"
      env.MAIL_TEST_CODE = "424242"
    })

    it("시험 도메인 주소로는 메일을 보내지 않고 시험 번호를 받아 준다", async () => {
      await service.issue("signup", "a@bot.test")

      expect(outbox).toHaveLength(0)
      await expect(
        service.verify("signup", "a@bot.test", "424242")
      ).resolves.toBeUndefined()
    })

    it("다른 도메인에는 시험 번호가 통하지 않는다", async () => {
      await service.issue("signup", EMAIL)

      await expect(
        service.verify("signup", EMAIL, "424242")
      ).rejects.toBeInstanceOf(ValidationError)
    })
  })
})
