import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { AuthError, ForbiddenError, NotFoundError } from "@repo/api-client"
import { JwtPayload } from "@repo/shared-types"
import { PrismaService } from "../../prisma/prisma.service"
import { isUserAdmin } from "../is-admin.util"

@Injectable()
export class TeamOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user as JwtPayload

    if (!user) throw new AuthError("유저 정보가 없습니다.")

    if (await isUserAdmin(this.prisma, user.sub)) return true

    // 공개 조회(TeamService.findOne)는 피드백 기간에 팀장을 가리므로 원본을 직접 읽는다
    const teamId = Number(request.params.id)
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { leaderId: true }
    })
    if (!team)
      throw new NotFoundError(`ID가 ${teamId}인 팀을 찾을 수 없습니다.`)

    const isOwner = team.leaderId === user.sub
    if (!isOwner) throw new ForbiddenError("팀장만 접근할 수 있습니다.")

    return true
  }
}
