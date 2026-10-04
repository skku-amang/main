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

export type AuthSessionMetadata = { userAgent?: string }

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
        userAgent: metadata.userAgent ?? "",
        createdAt: now,
        lastUsedAt: now
      })
      .expire(key, ttlSeconds)
      .exec()
  }

  /** 세션이 없으면 null, 있으면 저장된 RT와 일치 여부. */
  async matches(
    userId: number,
    sid: string,
    refreshToken: string
  ): Promise<boolean | null> {
    const tokenHash = await this.redis.hget(
      authSessionKey(userId, sid),
      "tokenHash"
    )
    if (tokenHash === null) return null
    return timingSafeEqual(
      Buffer.from(tokenHash),
      Buffer.from(hashToken(refreshToken))
    )
  }

  async rotate(
    userId: number,
    sid: string,
    refreshToken: string,
    ttlSeconds: number
  ): Promise<void> {
    const key = authSessionKey(userId, sid)
    await this.redis
      .multi()
      .hset(key, {
        tokenHash: hashToken(refreshToken),
        lastUsedAt: new Date().toISOString()
      })
      .expire(key, ttlSeconds)
      .exec()
  }

  async delete(userId: number, sid: string): Promise<void> {
    await this.redis.del(authSessionKey(userId, sid))
  }
}
