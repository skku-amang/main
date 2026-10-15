import { Module } from "@nestjs/common"
import { PushController } from "./push.controller"
import { PushService } from "./push.service"

@Module({
  controllers: [PushController],
  providers: [PushService]
})
export class PushModule {}
