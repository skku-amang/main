import { Inject, Injectable } from "@nestjs/common"
import { createHash, randomUUID, timingSafeEqual } from "crypto"
import Redis from "ioredis"
import { REDIS_CLIENT } from "../redis/redis.module"

/**
 * 로그인 세션(기기) 1개 = Redis Hash 1개 (#541).
 *
 * sid는 로그인 시 발급되어 로그아웃·만료 전까지 유지되고, refresh 때는
 * tokenHash만 교체된다. 기기 목록·원격 로그아웃을 sid로 가리킬 수 있도록
 * RT 자체가 아닌 sid를 키로 쓴다.
 *
 * "auth-session"은 밴드 Session(악기) 도메인과 구분하기 위한 이름이다.
 */
const authSessionKey = (userId: number, sid: string) =>
  `user:${userId}:auth-session:${sid}`

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex")

const hashEquals = (a: string, b: string) =>
  timingSafeEqual(Buffer.from(a), Buffer.from(b))

// Okta 기본값과 같다. 응답 유실 후 재시도까지만 메우면 되므로 짧게 둔다
const ROTATION_GRACE_MS = 30_000

// 클라이언트가 보낸 헤더라 길이를 믿을 수 없다
const USER_AGENT_MAX_LENGTH = 512

export type AuthSessionMetadata = { userAgent?: string }

export type AuthSessionRecord = {
  sid: string
  userAgent: string
  createdAt: string
  lastUsedAt: string
}

@Injectable()
export class AuthSessionStore {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  newSid(): string {
    return randomUUID()
  }

  async save(
    userId: number,
    sid: string,
    refreshToken: string,
    ttlSeconds: number,
    metadata: AuthSessionMetadata
  ): Promise<void> {
    const key = authSessionKey(userId, sid)
    const now = new Date().toISOString()
    await this.redis
      .multi()
      .hset(key, {
        tokenHash: hashToken(refreshToken),
        userAgent: (metadata.userAgent ?? "").slice(0, USER_AGENT_MAX_LENGTH),
        createdAt: now,
        lastUsedAt: now
      })
      .expire(key, ttlSeconds)
      .exec()
  }

  /**
   * 세션이 없으면 null, 있으면 RT 일치 여부.
   * 교체 직후 ROTATION_GRACE_MS 동안은 직전 RT도 인정한다 (#542) — 서버가 교체를
   * 끝냈는데 응답이 기기에 닿지 못하면 기기에는 직전 RT만 남기 때문이다.
   */
  async matches(
    userId: number,
    sid: string,
    refreshToken: string
  ): Promise<boolean | null> {
    const [tokenHash, prevTokenHash, rotatedAt] = await this.redis.hmget(
      authSessionKey(userId, sid),
      "tokenHash",
      "prevTokenHash",
      "rotatedAt"
    )
    if (!tokenHash) return null

    const received = hashToken(refreshToken)
    if (hashEquals(tokenHash, received)) return true

    if (!prevTokenHash || !rotatedAt) return false
    const inGrace =
      Date.now() - new Date(rotatedAt).getTime() < ROTATION_GRACE_MS
    return inGrace && hashEquals(prevTokenHash, received)
  }

  /** 현재 RT를 직전 RT 자리로 옮기고 새 RT로 바꾼다. 직전 RT는 한 번 쓰면 다음 교체로 밀려난다. */
  async rotate(
    userId: number,
    sid: string,
    refreshToken: string,
    ttlSeconds: number
  ): Promise<void> {
    const key = authSessionKey(userId, sid)
    const currentHash = await this.redis.hget(key, "tokenHash")
    const now = new Date().toISOString()
    await this.redis
      .multi()
      .hset(key, {
        tokenHash: hashToken(refreshToken),
        ...(currentHash && { prevTokenHash: currentHash }),
        rotatedAt: now,
        lastUsedAt: now
      })
      .expire(key, ttlSeconds)
      .exec()
  }

  async delete(userId: number, sid: string): Promise<void> {
    await this.redis.del(authSessionKey(userId, sid))
  }

  /** tokenHash는 store 밖으로 내보내지 않는다. */
  async list(userId: number): Promise<AuthSessionRecord[]> {
    const sids = await this.sidsOf(userId)
    if (sids.length === 0) return []

    const pipeline = this.redis.pipeline()
    sids.forEach((sid) => pipeline.hgetall(authSessionKey(userId, sid)))
    const results = (await pipeline.exec()) ?? []

    return sids.flatMap((sid, i) => {
      const [error, hash] = results[i] ?? []
      const session = hash as Record<string, string> | undefined
      // SCAN 이후 HGETALL 전에 만료된 키는 빈 Hash로 돌아온다
      if (error || !session?.tokenHash) return []
      return [
        {
          sid,
          userAgent: session.userAgent ?? "",
          createdAt: session.createdAt ?? "",
          lastUsedAt: session.lastUsedAt ?? ""
        }
      ]
    })
  }

  async deleteAllExcept(userId: number, keepSid: string): Promise<void> {
    const keys = (await this.sidsOf(userId))
      .filter((sid) => sid !== keepSid)
      .map((sid) => authSessionKey(userId, sid))
    if (keys.length > 0) await this.redis.del(...keys)
  }

  private async sidsOf(userId: number): Promise<string[]> {
    const prefix = authSessionKey(userId, "")
    const sids = new Set<string>()
    let cursor = "0"
    do {
      const [next, keys] = await this.redis.scan(
        cursor,
        "MATCH",
        `${prefix}*`,
        "COUNT",
        100
      )
      cursor = next
      keys.forEach((key) => sids.add(key.slice(prefix.length)))
    } while (cursor !== "0")
    return [...sids]
  }
}
