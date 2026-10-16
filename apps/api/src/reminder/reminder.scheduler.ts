import { Inject, Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import * as Sentry from "@sentry/nestjs"
import Redis from "ioredis"
import { PushDeferredService } from "../push/push-deferred.service"
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
    reminderService: ReminderService,
    pushDeferred: PushDeferredService
  ) {
    this.reminders = [
      { name: "deferred_push", run: (now) => pushDeferred.flush(now) },
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
    let locked: string | null
    try {
      locked = await this.redis.set(LOCK_KEY, "1", "PX", LOCK_TTL_MS, "NX")
    } catch (error) {
      // @nestjs/schedule은 예외를 Logger.error로만 삼켜 Sentry Issue가 안 생긴다 — 직접 보낸다
      Sentry.captureException(error)
      this.logger.error("리마인더 락 획득 실패", error)
      return false
    }
    if (locked !== "OK") return false

    try {
      for (const reminder of this.reminders) {
        const result = await this.runReminder(reminder, now)
        Sentry.metrics.count("reminder.run", 1, {
          attributes: { reminder: reminder.name, result }
        })
      }
    } finally {
      // 실행이 TTL(5분)을 넘기면 다른 pod의 락을 지울 수 있지만, 실행은 ms 단위고 중복은 DB 멱등이 막는다
      await this.redis.del(LOCK_KEY)
    }
    return true
  }

  private async runReminder(reminder: Reminder, now: Date) {
    try {
      const count = await reminder.run(now)
      if (count > 0) this.logger.log(`${reminder.name}: ${count}건`)
      return "ok"
    } catch (error) {
      Sentry.captureException(error)
      this.logger.error(`${reminder.name} 실패`, error)
      return "error"
    }
  }
}
