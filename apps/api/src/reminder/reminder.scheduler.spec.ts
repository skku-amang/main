import RedisMock from "ioredis-mock"
import { ReminderScheduler } from "./reminder.scheduler"
import { ReminderService } from "./reminder.service"

const NOW = new Date("2026-10-16T14:50:00Z")

describe("ReminderScheduler", () => {
  let redis: InstanceType<typeof RedisMock>
  let remind: jest.Mock
  let scheduler: ReminderScheduler

  beforeEach(async () => {
    redis = new RedisMock()
    await redis.flushall()
    remind = jest.fn(async () => 2)
    scheduler = new ReminderScheduler(redis, {
      remindRecruitmentDeadline: remind
    } as unknown as ReminderService)
  })

  afterEach(() => redis.disconnect())

  it("락을 잡고 리마인더를 돌린 뒤 락을 푼다", async () => {
    await expect(scheduler.runOnce(NOW)).resolves.toBe(true)

    expect(remind).toHaveBeenCalledWith(NOW)
    await expect(redis.get("reminder:lock")).resolves.toBeNull()
  })

  it("다른 pod가 락을 쥐고 있으면 돌지 않는다", async () => {
    await redis.set("reminder:lock", "1")

    await expect(scheduler.runOnce(NOW)).resolves.toBe(false)

    expect(remind).not.toHaveBeenCalled()
  })

  it("리마인더가 실패해도 예외를 밖으로 내지 않고 락은 푼다", async () => {
    remind.mockRejectedValue(new Error("db down"))

    await expect(scheduler.runOnce(NOW)).resolves.toBe(true)

    await expect(redis.get("reminder:lock")).resolves.toBeNull()
  })
})
