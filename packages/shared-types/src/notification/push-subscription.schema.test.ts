import { describe, expect, it } from "vitest"
import {
  CreatePushSubscriptionSchema,
  DeletePushSubscriptionSchema
} from "./push-subscription.schema"

describe("CreatePushSubscriptionSchema", () => {
  it("브라우저 PushSubscription.toJSON() 형태를 받는다", () => {
    const result = CreatePushSubscriptionSchema.safeParse({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc",
      keys: { p256dh: "BPk...", auth: "k9..." }
    })
    expect(result.success).toBe(true)
  })

  it("endpoint가 URL이 아니거나 키가 비면 거부한다", () => {
    expect(
      CreatePushSubscriptionSchema.safeParse({
        endpoint: "not-a-url",
        keys: { p256dh: "x", auth: "y" }
      }).success
    ).toBe(false)
    expect(
      CreatePushSubscriptionSchema.safeParse({
        endpoint: "https://fcm.googleapis.com/fcm/send/abc",
        keys: { p256dh: "", auth: "y" }
      }).success
    ).toBe(false)
  })
})

describe("DeletePushSubscriptionSchema", () => {
  it("endpoint만 받는다", () => {
    expect(
      DeletePushSubscriptionSchema.parse({
        endpoint: "https://fcm.googleapis.com/fcm/send/abc"
      })
    ).toEqual({ endpoint: "https://fcm.googleapis.com/fcm/send/abc" })
  })
})
