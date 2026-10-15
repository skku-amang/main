import { Body, Controller, Delete, Post, Req, UseGuards } from "@nestjs/common"
import { JwtPayload } from "@repo/shared-types"
import { Request } from "express"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { CreatePushSubscriptionDto } from "./dto/create-push-subscription.dto"
import { DeletePushSubscriptionDto } from "./dto/delete-push-subscription.dto"
import { PushService } from "./push.service"

@Controller("push/subscriptions")
@UseGuards(AccessTokenGuard)
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post()
  subscribe(@Req() req: Request, @Body() dto: CreatePushSubscriptionDto) {
    const user = req.user as JwtPayload
    return this.pushService.subscribe(user.sub, dto)
  }

  @Delete()
  unsubscribe(@Req() req: Request, @Body() dto: DeletePushSubscriptionDto) {
    const user = req.user as JwtPayload
    return this.pushService.unsubscribe(user.sub, dto)
  }
}
