import { Module } from "@nestjs/common"
import { PushModule } from "../push/push.module"
import { RedisModule } from "../redis/redis.module"
import { ReminderScheduler } from "./reminder.scheduler"
import { ReminderService } from "./reminder.service"

@Module({
  imports: [RedisModule, PushModule],
  providers: [ReminderService, ReminderScheduler]
})
export class ReminderModule {}
