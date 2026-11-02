import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UseGuards
} from "@nestjs/common"
import { JwtPayload } from "@repo/shared-types"
import { Request } from "express"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { UpsertFeedbackDto } from "./dto/upsert-feedback.dto"
import { FeedbackService } from "./feedback.service"

@Controller()
@UseGuards(AccessTokenGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get("performances/:id/feedback/mine")
  getMine(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as JwtPayload
    return this.feedbackService.getMine(id, user.sub)
  }

  @Put("teams/:id/feedback")
  upsert(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpsertFeedbackDto,
    @Req() req: Request
  ) {
    const user = req.user as JwtPayload
    return this.feedbackService.upsert(id, user.sub, dto)
  }
}
