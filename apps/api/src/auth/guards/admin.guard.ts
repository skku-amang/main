import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { ForbiddenError } from "@repo/api-client"
import { JwtPayload } from "@repo/shared-types"

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user as JwtPayload

    if (user && user.isAdmin) {
      return true
    }

    throw new ForbiddenError("관리자 권한이 필요합니다.")
  }
}
