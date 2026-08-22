import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { ForbiddenError } from "@repo/api-client"
import { JwtPayload } from "@repo/shared-types"
import { PrismaService } from "../../prisma/prisma.service"
import { isUserAdmin } from "../is-admin.util"

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user as JwtPayload

    if (user && (await isUserAdmin(this.prisma, user.sub))) {
      return true
    }

    throw new ForbiddenError("관리자 권한이 필요합니다.")
  }
}
