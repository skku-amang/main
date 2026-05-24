import { z } from "zod"
import { fromError } from "zod-validation-error"

/**
 * 부팅 시점 env 검증 schema (fail-fast).
 */
export const envSchema = z
  .object({
    // Database (required) — Prisma 부팅에 필수
    DATABASE_URL: z.string().url(),

    // JWT (required) — auth 모듈 부팅에 필수
    ACCESS_TOKEN_SECRET: z.string().min(1),
    REFRESH_TOKEN_SECRET: z.string().min(1),
    ACCESS_TOKEN_EXPIRES_IN_SECONDS: z.coerce.number().int().positive(),
    REFRESH_TOKEN_EXPIRES_IN_SECONDS: z.coerce.number().int().positive(),

    // Redis — use case 미정이라 optional. 의존성/모듈 등록 PR에서 required 전환
    REDIS_HOST: z.string().min(1).optional(),
    REDIS_PORT: z.coerce.number().int().min(1).max(65535).optional(),
    REDIS_PASSWORD: z.string().min(1).optional()
  })
  .passthrough()

export type Env = z.infer<typeof envSchema>

/**
 * ConfigModule.forRoot({ validate }) 콜백.
 * 검증 실패 시 zod-validation-error로 사람이 읽을 수 있는 메시지로 변환 후 throw.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config)
  if (!result.success) {
    throw new Error(
      `환경변수 검증 실패:\n${fromError(result.error).toString()}`
    )
  }
  return result.data
}
