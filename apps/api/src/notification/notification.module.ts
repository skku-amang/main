import { Module } from "@nestjs/common"
import { NotificationController } from "./notification.controller"
import { NotificationListener } from "./notification.listener"
import { NotificationService } from "./notification.service"

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, NotificationListener]
})
export class NotificationModule {}
