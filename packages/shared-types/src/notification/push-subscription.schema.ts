import { z } from "zod"

/**
 * @description 브라우저 `PushSubscription.toJSON()` 그대로 보낸다 (expirationTime 등 추가 키는 무시).
 */
export const CreatePushSubscriptionSchema = z.object({
  endpoint: z.string().url("endpoint는 푸시 서비스 URL이어야 합니다."),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1)
  })
})

export type CreatePushSubscription = z.infer<
  typeof CreatePushSubscriptionSchema
>

export const DeletePushSubscriptionSchema = z.object({
  endpoint: z.string().url()
})

export type DeletePushSubscription = z.infer<
  typeof DeletePushSubscriptionSchema
>
