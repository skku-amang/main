import { Inject, Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import * as Sentry from "@sentry/nestjs"
import Redis from "ioredis"
import { REDIS_CLIENT } from "../redis/redis.module"
import { ReminderService } from "./reminder.service"

const LOCK_KEY = "reminder:lock"
const LOCK_TTL_MS = 5 * 60_000

type Reminder = { name: string; run: (now: Date) => Promise<number> }

/**
 * 시간 기반 알림의 틀. 10분마다 깨어나 리마인더를 차례로 돌린다.
 * pod가 여럿이어도 Redis 락으로 한 번만 돈다 — 락을 못 잡으면 다른 pod가 돌고 있는 것.
 * 리마인더 하나가 실패해도 나머지는 돌고, 실패는 Sentry로 보낸다.
 */
@Injectable()
export class ReminderScheduler {
  private readonly logger = new Logger(ReminderScheduler.name)
  private readonly reminders: Reminder[]

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    reminderService: ReminderService
  ) {
    this.reminders = [
      {
        name: "team_recruitment_deadline",
        run: (now) => reminderService.remindRecruitmentDeadline(now)
      }
    ]
  }

  @Cron("*/10 * * * *")
  tick() {
    return this.runOnce(new Date())
  }

  /** @returns 락을 잡아 실제로 돌았는지 */
  async runOnce(now: Date) {
    const locked = await this.redis.set(LOCK_KEY, "1", "PX", LOCK_TTL_MS, "NX")
    if (locked !== "OK") return false

    try {
      for (const reminder of this.reminders) {
        try {
          const count = await reminder.run(now)
          Sentry.metrics.count("reminder.run", 1, {
            attributes: { reminder: reminder.name, result: "ok" }
          })
          if (count > 0) this.logger.log(`${reminder.name}: ${count}건`)
        } catch (error) {
          Sentry.captureException(error)
          this.logger.error(`${reminder.name} 실패`, error)
        }
      }
    } finally {
      await this.redis.del(LOCK_KEY)
    }
    return true
  }
}
