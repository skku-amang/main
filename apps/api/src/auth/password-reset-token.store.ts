import { Inject, Injectable } from "@nestjs/common"
import { createHash, randomBytes } from "crypto"
import Redis from "ioredis"
import { REDIS_CLIENT } from "../redis/redis.module"

// 운영진이 카톡으로 전달할 시간을 넉넉히 준다
const TOKEN_TTL_SECONDS = 24 * 60 * 60

// 토큰은 32바이트 무작위 값이라 추측으로 맞힐 수 없다. 사람이 정한 비밀번호가 아니므로
// bcrypt 같은 느린 해시 대신 sha256으로 충분하고, 해시가 곧 조회 키라 솔트도 쓸 수 없다
const tokenKey = (token: string) =>
  `password-reset-token:${createHash("sha256").update(token).digest("hex")}`

/** 운영진이 만드는 비밀번호 재설정 링크의 일회용 토큰 (#528). 해시만 저장한다 */
@Injectable()
export class PasswordResetTokenStore {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async create(userId: number): Promise<{ token: string; expiresAt: Date }> {
    const token = randomBytes(32).toString("base64url")
    await this.redis.set(tokenKey(token), userId, "EX", TOKEN_TTL_SECONDS)
    return {
      token,
      expiresAt: new Date(Date.now() + TOKEN_TTL_SECONDS * 1000)
    }
  }

  /** 맞으면 회원 id를 돌려주고 토큰을 지운다. 없거나 만료면 null */
  async consume(token: string): Promise<number | null> {
    const userId = await this.redis.getdel(tokenKey(token))
    return userId === null ? null : Number(userId)
  }
}
