import { Inject, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { UnprocessableEntityError, ValidationError } from "@repo/api-client"
import { EMAIL_CODE_LENGTH } from "@repo/shared-types"
import { createHash, randomInt, timingSafeEqual } from "crypto"
import Redis from "ioredis"
import { REDIS_CLIENT } from "../redis/redis.module"
import { MailService } from "./mail.service"

/** 설계: docs/explanation/design/email-verification-password-reset.md */
export type EmailCodePurpose = "signup" | "verify" | "reset"

const CODE_TTL_SECONDS = 10 * 60
const COOLDOWN_SECONDS = 60
const HOURLY_LIMIT = 5
const MAX_ATTEMPTS = 5

const PURPOSE_TEXT: Record<EmailCodePurpose, string> = {
  signup: "아망 회원가입을 위한 이메일 인증번호입니다.",
  verify: "아망 계정의 이메일 인증번호입니다.",
  reset: "아망 비밀번호를 다시 정하기 위한 인증번호입니다."
}

const codeKey = (purpose: EmailCodePurpose, email: string) =>
  `email-code:${purpose}:${email}`
const cooldownKey = (purpose: EmailCodePurpose, email: string) =>
  `email-code-cooldown:${purpose}:${email}`
const hourlyKey = (email: string) => `email-code-hourly:${email}`

const hash = (code: string) => createHash("sha256").update(code).digest("hex")

const invalidCode = () =>
  new ValidationError("인증번호가 맞지 않거나 만료되었습니다.")

@Injectable()
export class EmailCodeService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly mailService: MailService,
    private readonly configService: ConfigService
  ) {}

  async issue(purpose: EmailCodePurpose, rawEmail: string): Promise<void> {
    const email = rawEmail.toLowerCase()
    if (this.isTestAddress(email)) return

    const cooling = await this.redis.set(
      cooldownKey(purpose, email),
      "1",
      "EX",
      COOLDOWN_SECONDS,
      "NX"
    )
    if (!cooling)
      throw new UnprocessableEntityError(
        `인증번호는 ${COOLDOWN_SECONDS}초에 한 번 받을 수 있습니다.`
      )

    // 한 번에 보내야 INCR 직후 프로세스가 죽어도 만료 없는 카운터가 남지 않는다
    const counted = await this.redis
      .multi()
      .incr(hourlyKey(email))
      .expire(hourlyKey(email), 60 * 60, "NX")
      .exec()
    const sent = Number(counted?.[0]?.[1])
    if (sent > HOURLY_LIMIT)
      throw new UnprocessableEntityError(
        "인증번호를 너무 많이 요청했습니다. 한 시간 뒤에 다시 시도해주세요."
      )

    const code = randomInt(0, 10 ** EMAIL_CODE_LENGTH)
      .toString()
      .padStart(EMAIL_CODE_LENGTH, "0")
    await this.redis
      .multi()
      .del(codeKey(purpose, email))
      .hset(codeKey(purpose, email), { hash: hash(code), attempts: 0 })
      .expire(codeKey(purpose, email), CODE_TTL_SECONDS)
      .exec()

    await this.mailService.send({
      to: email,
      subject: `[아망] 인증번호 ${code}`,
      text: [
        PURPOSE_TEXT[purpose],
        "",
        `인증번호: ${code}`,
        "",
        `${CODE_TTL_SECONDS / 60}분 안에 입력해주세요.`,
        "요청한 적이 없다면 이 메일은 무시하셔도 됩니다."
      ].join("\n")
    })
  }

  /** 맞으면 인증번호를 지운다 (한 번만 쓸 수 있음). 틀리거나 없으면 ValidationError */
  async verify(
    purpose: EmailCodePurpose,
    email: string,
    code: string
  ): Promise<void> {
    await this.check(purpose, email, code)
    // 같은 번호로 동시에 들어오면 지운 쪽 한 요청만 통과한다
    if (!(await this.consume(purpose, email))) throw invalidCode()
  }

  /** 맞는지만 본다 — 번호는 남는다. 뒤따르는 작업이 성공한 뒤 consume으로 지운다 */
  async check(
    purpose: EmailCodePurpose,
    rawEmail: string,
    code: string
  ): Promise<void> {
    const email = rawEmail.toLowerCase()
    if (this.isTestAddress(email)) {
      if (code === this.configService.get<string>("MAIL_TEST_CODE")) return
      throw invalidCode()
    }

    const key = codeKey(purpose, email)
    const stored = await this.redis.hget(key, "hash")
    if (!stored) throw invalidCode()

    if (timingSafeEqual(Buffer.from(stored), Buffer.from(hash(code)))) return

    const attempts = await this.redis.hincrby(key, "attempts", 1)
    if (attempts >= MAX_ATTEMPTS) await this.redis.del(key)
    throw invalidCode()
  }

  /** 인증번호를 지운다. 이미 없었으면 false */
  async consume(purpose: EmailCodePurpose, rawEmail: string): Promise<boolean> {
    const email = rawEmail.toLowerCase()
    if (this.isTestAddress(email)) return true
    return (await this.redis.del(codeKey(purpose, email))) === 1
  }

  private isTestAddress(email: string) {
    const domain = this.configService.get<string>("MAIL_TEST_DOMAIN")
    return !!domain && email.endsWith(`@${domain.toLowerCase()}`)
  }
}
