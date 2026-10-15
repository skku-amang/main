import { Module } from "@nestjs/common"
import { PushController } from "./push.controller"
import { PushListener } from "./push.listener"
import { PushSender } from "./push.sender"
import { PushService } from "./push.service"

@Module({
  controllers: [PushController],
  providers: [PushService, PushSender, PushListener]
})
export class PushModule {}
