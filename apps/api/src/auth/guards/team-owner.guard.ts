import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { AuthError, ForbiddenError } from "@repo/api-client"
import { JwtPayload } from "@repo/shared-types"
import { PrismaService } from "../../prisma/prisma.service"
import { TeamService } from "../../team/team.service"
import { isUserAdmin } from "../is-admin.util"

@Injectable()
export class TeamOwnerGuard implements CanActivate {
  constructor(
    private readonly teamService: TeamService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user as JwtPayload

    if (!user) throw new AuthError("유저 정보가 없습니다.")

    if (await isUserAdmin(this.prisma, user.sub)) return true

    const teamId = request.params.id
    const team = await this.teamService.findOne(+teamId)

    const isOwner = team.leaderId === user.sub
    if (!isOwner) throw new ForbiddenError("팀장만 접근할 수 있습니다.")

    return true
  }
}
