import { z } from "zod"
import { fromError } from "zod-validation-error"

export const envSchema = z
  .object({
    DATABASE_URL: z.string().url(),
    ACCESS_TOKEN_SECRET: z.string().min(1),
    REFRESH_TOKEN_SECRET: z.string().min(1),
    ACCESS_TOKEN_EXPIRES_IN_SECONDS: z.coerce.number().int().positive(),
    REFRESH_TOKEN_EXPIRES_IN_SECONDS: z.coerce.number().int().positive(),
    REDIS_HOST: z.string().min(1),
    REDIS_PASSWORD: z.string().min(1),
    // Web Push. 셋 다 있어야 발송하고, 없으면 발송만 건너뛴다 (알림함은 동작)
    VAPID_PUBLIC_KEY: z.string().min(1).optional(),
    VAPID_PRIVATE_KEY: z.string().min(1).optional(),
    VAPID_SUBJECT: z.string().startsWith("mailto:").optional()
  })
  .passthrough()

export type Env = z.infer<typeof envSchema>

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config)
  if (!result.success) {
    throw new Error(
      `환경변수 검증 실패:\n${fromError(result.error).toString()}`
    )
  }
  return result.data
}
