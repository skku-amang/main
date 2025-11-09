import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
  UseGuards
} from "@nestjs/common"
import { JwtPayload } from "@repo/shared-types"
import { Request } from "express"

import { Public } from "../auth/decorators/public.decorator"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { TeamOwnerGuard } from "../auth/guards/team-owner.guard"
import { CreateTeamDto } from "./dto/create-team.dto"
import { TeamApplicationDto } from "./dto/team-application.dto"
import { UpdateTeamDto } from "./dto/update-team.dto"
import { TeamService } from "./team.service"

@Controller("teams")
@UseGuards(AccessTokenGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamService.create(createTeamDto)
  }

  @Get()
  @Public()
  findAll() {
    return this.teamService.findAll()
  }

  @Get(":id")
  @Public()
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.teamService.findOne(id)
  }

  @Put(":id")
  @UseGuards(TeamOwnerGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateTeamDto: UpdateTeamDto
  ) {
    return this.teamService.update(id, updateTeamDto)
  }

  @Delete(":id")
  @UseGuards(TeamOwnerGuard)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.teamService.remove(id)
  }

  @Patch(":id/apply")
  apply(
    @Param("id", ParseIntPipe) id: number,
    @Body() applyTeamDto: TeamApplicationDto,
    @Req() req: Request
  ) {
    const user = req.user as JwtPayload
    return this.teamService.apply(id, user.sub, applyTeamDto)
  }

  @Patch(":id/unapply")
  unapply(
    @Param("id", ParseIntPipe) id: number,
    @Body() unapplyTeamDto: TeamApplicationDto,
    @Req() req: Request
  ) {
    const user = req.user as JwtPayload
    return this.teamService.unapply(id, user.sub, unapplyTeamDto)
  }
}
