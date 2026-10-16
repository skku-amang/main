import {
  Body,
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
import { MarkNotificationsReadBySubjectDto } from "./dto/mark-read-by-subject.dto"
import { UpdateNotificationPreferencesDto } from "./dto/update-preferences.dto"
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

  @Get("preferences")
  getPreferences(@Req() req: Request) {
    const user = req.user as JwtPayload
    return this.notificationService.getPreferences(user.sub)
  }

  /** 보낸 필드만 바꾼다. quietHours는 통째로 */
  @Patch("preferences")
  updatePreferences(
    @Req() req: Request,
    @Body() dto: UpdateNotificationPreferencesDto
  ) {
    const user = req.user as JwtPayload
    return this.notificationService.updatePreferences(user.sub, dto)
  }

  @Patch("read-all")
  markAllRead(@Req() req: Request) {
    const user = req.user as JwtPayload
    return this.notificationService.markAllRead(user.sub)
  }

  /** 알림이 가리키는 팀/공연 페이지에 도달했을 때 — 그 대상의 알림을 읽음 처리 */
  @Patch("read")
  markReadBySubject(
    @Req() req: Request,
    @Body() dto: MarkNotificationsReadBySubjectDto
  ) {
    const user = req.user as JwtPayload
    return this.notificationService.markReadBySubject(user.sub, dto)
  }

  @Patch(":id/read")
  markRead(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    const user = req.user as JwtPayload
    return this.notificationService.markRead(user.sub, id)
  }
}
