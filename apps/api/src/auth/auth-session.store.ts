import { Inject, Injectable } from "@nestjs/common"
import { createHash, randomUUID } from "crypto"
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

export type RotateResult = "rotated" | "mismatch" | "missing"

// 확인과 교체를 한 스크립트로 한다. 나눠 보내면 그 사이에 같은 직전 RT가 두 번 통하거나,
// 지워진 세션(로그아웃·비밀번호 변경)을 HSET이 되살린다.
// 유예 시각은 Redis 시계로 잰다 — 스크립트가 늦게 도착한 만큼 유예가 줄지 않게.
// HMGET 대신 HGET을 쓰는 건 ioredis-mock이 HMGET의 빈 값을 Lua false로 넘기지 않아서다
// KEYS[1] 세션 | ARGV 받은 RT 해시, 새 RT 해시, 유예 ms, lastUsedAt, TTL 초
const ROTATE_SCRIPT = `
local current = redis.call('HGET', KEYS[1], 'tokenHash')
local prev = redis.call('HGET', KEYS[1], 'prevTokenHash')
if not current then return -1 end
-- 응답 전에 연결이 끊겨 같은 명령이 다시 오면, 이미 바꾼 결과를 그대로 둔다
if current == ARGV[2] and prev == ARGV[1] then return 1 end
local t = redis.call('TIME')
local now = t[1] * 1000 + math.floor(t[2] / 1000)
local rotatedAt = tonumber(redis.call('HGET', KEYS[1], 'rotatedAt'))
local inGrace = prev and rotatedAt and now - rotatedAt < tonumber(ARGV[3])
if current ~= ARGV[1] and not (inGrace and prev == ARGV[1]) then return 0 end
redis.call('HSET', KEYS[1], 'tokenHash', ARGV[2], 'prevTokenHash', current, 'rotatedAt', now, 'lastUsedAt', ARGV[4])
redis.call('EXPIRE', KEYS[1], ARGV[5])
return 1
`

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
   * 받은 RT가 맞으면 새 RT로 바꾸고, 바꾸기 전 RT를 직전 RT 자리에 둔다.
   * 교체 직후 ROTATION_GRACE_MS 동안은 직전 RT도 인정한다 (#542) — 서버가 교체를
   * 끝냈는데 응답이 기기에 닿지 못하면 기기에는 직전 RT만 남기 때문이다.
   * 직전 RT는 한 번 쓰면 다음 교체로 밀려난다.
   */
  async rotate(
    userId: number,
    sid: string,
    receivedToken: string,
    newToken: string,
    ttlSeconds: number
  ): Promise<RotateResult> {
    const result = await this.redis.eval(
      ROTATE_SCRIPT,
      1,
      authSessionKey(userId, sid),
      hashToken(receivedToken),
      hashToken(newToken),
      ROTATION_GRACE_MS,
      new Date().toISOString(),
      ttlSeconds
    )
    if (result === 1) return "rotated"
    return result === 0 ? "mismatch" : "missing"
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
