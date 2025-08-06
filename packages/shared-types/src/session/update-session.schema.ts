import { z } from "zod"
import { CreateSessionSchema } from "./create-session.schema"

/**
 * @description 세션 업데이트 Zod 스키마
 * 모든 필드를 선택적으로 만들어서 부분 업데이트를 지원합니다.
 * users 필드를 추가하여 세션에 속한 사용자 목록을 업데이트할 수 있습니다.
 */
export const UpdateSessionSchema = CreateSessionSchema.partial()
  .extend({
    /**
     * @description 세션에 속한 사용자들의 ID 배열
     */
    users: z.array(z.number().int()).optional()
  })
  .strict()

/**
 * @description 세션 업데이트 타입 (프론트엔드용)
 */
export type UpdateSession = z.infer<typeof UpdateSessionSchema>
