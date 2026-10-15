import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards
} from "@nestjs/common"
import { JwtPayload } from "@repo/shared-types"
import { Request } from "express"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { GetNotificationsQueryDto } from "./dto/get-notifications-query.dto"
import { NotificationService } from "./notification.service"

@Controller("notifications")
@UseGuards(AccessTokenGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(@Req() req: Request, @Query() query: GetNotificationsQueryDto) {
    const user = req.user as JwtPayload
    return this.notificationService.findAll(user.sub, query)
  }

  @Get("unread-count")
  countUnread(@Req() req: Request) {
    const user = req.user as JwtPayload
    return this.notificationService.countUnread(user.sub)
  }

  @Patch("read-all")
  markAllRead(@Req() req: Request) {
    const user = req.user as JwtPayload
    return this.notificationService.markAllRead(user.sub)
  }

  @Patch(":id/read")
  markRead(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    const user = req.user as JwtPayload
    return this.notificationService.markRead(user.sub, id)
  }
}
