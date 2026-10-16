import { Module } from "@nestjs/common"
import { RedisModule } from "../redis/redis.module"
import { ReminderScheduler } from "./reminder.scheduler"
import { ReminderService } from "./reminder.service"

@Module({
  imports: [RedisModule],
  providers: [ReminderService, ReminderScheduler]
})
export class ReminderModule {}
