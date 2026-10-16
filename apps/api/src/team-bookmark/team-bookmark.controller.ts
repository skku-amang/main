import {
  Controller,
  Delete,
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
import { TeamBookmarkService } from "./team-bookmark.service"

// /teams/bookmarks로 두면 TeamController의 /teams/:id(ParseIntPipe)에 먼저 걸린다
@Controller("team-bookmarks")
@UseGuards(AccessTokenGuard)
export class TeamBookmarkController {
  constructor(private readonly teamBookmarkService: TeamBookmarkService) {}

  @Get()
  findMine(@Req() req: Request) {
    const user = req.user as JwtPayload
    return this.teamBookmarkService.findTeamIds(user.sub)
  }

  @Put(":teamId")
  add(@Req() req: Request, @Param("teamId", ParseIntPipe) teamId: number) {
    const user = req.user as JwtPayload
    return this.teamBookmarkService.add(user.sub, teamId)
  }

  @Delete(":teamId")
  remove(@Req() req: Request, @Param("teamId", ParseIntPipe) teamId: number) {
    const user = req.user as JwtPayload
    return this.teamBookmarkService.remove(user.sub, teamId)
  }
}
